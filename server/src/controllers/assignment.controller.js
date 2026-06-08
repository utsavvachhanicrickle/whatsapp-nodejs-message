import pool from "../../config/db.js";
import AppError from "../utils/AppError.js";
import { createPassword } from "../utils/schema/index.js";
import { clients } from "../socket.js";
import { safeClientCall } from "../utils/whatsappUtils.js";

const normalizeChatId = (chatId) => {
  if (chatId && !chatId.includes("@")) {
    return `${chatId.replace(/\D/g, "")}@c.us`;
  }
  return chatId;
};

export const assignChat = async (req, res, next) => {
  try {
    const { sessionId, chatId, email } = req.body;
    const assignedBy = req.userId;

    if (!sessionId || !chatId) {
      return next(new AppError("Missing sessionId or chatId", 400));
    }

    const io = req.app.get("io");
    const normalizedChatId = normalizeChatId(chatId);

    if (!email) {
      // Find the previous assignee before deleting the assignment
      const prevRes = await pool.query(
        'SELECT "assignedTo" FROM chat_assignments WHERE "sessionId" = $1 AND "chatId" = $2',
        [sessionId, normalizedChatId]
      );

      // Unassign the chat
      await pool.query(
        'DELETE FROM chat_assignments WHERE "sessionId" = $1 AND "chatId" = $2',
        [sessionId, normalizedChatId]
      );

      if (prevRes.rows.length > 0) {
        const prevAssigneeId = prevRes.rows[0].assignedTo;
        if (io) {
          io.to(`user_${prevAssigneeId}`).emit("assignments-updated", {
            sessionId,
            chatId: normalizedChatId,
            action: "unassigned"
          });
        }
      }

      return res.json({ success: true, message: "Chat unassigned successfully" });
    }

    // Check if user exists
    let userResult = await pool.query('SELECT _id, name FROM users WHERE email = $1', [email]);
    let targetUserId;
    let name = email.split('@')[0];

    if (userResult.rows.length === 0) {
      // Auto-register user with default password '12345678'
      const defaultPassword = '12345678';
      const hashedPassword = await createPassword(defaultPassword);
      const insertResult = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING _id, name',
        [name, email, hashedPassword]
      );
      targetUserId = insertResult.rows[0]._id;
      name = insertResult.rows[0].name;
      console.log(`Auto-registered teammate ${email} with default password '12345678'`);
    } else {
      targetUserId = userResult.rows[0]._id;
      name = userResult.rows[0].name;
    }

    // Upsert assignment
    await pool.query(
      `INSERT INTO chat_assignments ("sessionId", "chatId", "assignedTo", "assignedBy")
       VALUES ($1, $2, $3, $4)
       ON CONFLICT ("sessionId", "chatId")
       DO UPDATE SET "assignedTo" = EXCLUDED."assignedTo", "assignedBy" = EXCLUDED."assignedBy", "updatedAt" = CURRENT_TIMESTAMP`,
      [sessionId, normalizedChatId, targetUserId, assignedBy]
    );

    if (io) {
      io.to(`user_${targetUserId}`).emit("assignments-updated", {
        sessionId,
        chatId: normalizedChatId,
        action: "assigned"
      });
    }

    return res.json({
      success: true,
      message: "Chat assigned successfully",
      assignee: { id: targetUserId, name, email }
    });
  } catch (error) {
    console.error("Assign chat error:", error);
    return next(new AppError("Failed to assign chat", 500));
  }
};

export const getChatAssignment = async (req, res, next) => {
  try {
    const { sessionId, chatId } = req.params;
    const normalizedChatId = normalizeChatId(chatId);

    const query = `
      SELECT ca.*, u.name as "assignedToName", u.email as "assignedToEmail"
      FROM chat_assignments ca
      JOIN users u ON u._id = ca."assignedTo"
      WHERE ca."sessionId" = $1 AND ca."chatId" = $2
    `;
    const result = await pool.query(query, [sessionId, normalizedChatId]);

    if (result.rows.length === 0) {
      return res.json({ success: true, assignment: null });
    }

    return res.json({ success: true, assignment: result.rows[0] });
  } catch (error) {
    console.error("Get chat assignment error:", error);
    return next(new AppError("Failed to fetch assignment details", 500));
  }
};

export const getAssignedChats = async (req, res, next) => {
  try {
    const userId = req.userId;

    const query = `
      WITH LastMsg AS (
        SELECT 
          "chatId",
          "sessionId",
          body,
          "type",
          timestamp,
          "fromMe",
          ROW_NUMBER() OVER (PARTITION BY "chatId", "sessionId" ORDER BY timestamp DESC) as rn
        FROM (
          SELECT pm."chatId", m."sessionId", pm.body, pm.type, pm.timestamp, pm."fromMe"
          FROM personal_messages pm
          JOIN messages m ON m."personalMessageId" = pm._id
          UNION ALL
          SELECT gm."chatId", m."sessionId", gm.body, gm.type, gm.timestamp, gm."fromMe"
          FROM group_messages gm
          JOIN messages m ON m."groupMessageId" = gm._id
        ) all_msgs
      )
      SELECT 
        ca."sessionId",
        ca."chatId",
        COALESCE(c.name, ca."chatId") as name,
        COALESCE(c."pushName", '') as "pushName",
        COALESCE(c."phoneNumber", '') as "phoneNumber",
        lm.body as "lastMessageBody",
        lm.type as "lastMessageType",
        lm.timestamp as "lastMessageTimestamp",
        lm."fromMe" as "lastMessageFromMe",
        (ca."chatId" LIKE '%@g.us') as "isGroup"
      FROM chat_assignments ca
      LEFT JOIN contacts c ON (c."whatsappId" = ca."chatId" AND c."sessionId" = ca."sessionId")
      LEFT JOIN LastMsg lm ON (lm."chatId" = ca."chatId" AND lm."sessionId" = ca."sessionId" AND lm.rn = 1)
      WHERE ca."assignedTo" = $1
      ORDER BY COALESCE(lm.timestamp, 0) DESC
    `;
    const result = await pool.query(query, [userId]);
    const chats = result.rows;

    // Resolve real-time group and contact names from active WhatsApp client if available
    for (const chat of chats) {
      const client = clients[chat.sessionId];
      if (client && client.isReady) {
        try {
          const wwebChat = await safeClientCall(client, "getChatById", [chat.chatId]);
          if (wwebChat) {
            chat.name = wwebChat.name || chat.name;
          }
        } catch (err) {
          console.warn(`[getAssignedChats] Failed to resolve name for ${chat.chatId}:`, err.message);
        }
      }
    }

    return res.json({ success: true, chats });
  } catch (error) {
    console.error("Get assigned chats error:", error);
    return next(new AppError("Failed to fetch assigned chats", 500));
  }
};

export const getChatNotes = async (req, res, next) => {
  try {
    const { sessionId, chatId } = req.params;
    const loggedInUserId = req.userId;
    const targetUserId = req.query.userId || loggedInUserId;

    if (!sessionId || !chatId) {
      return next(new AppError("Missing sessionId or chatId", 400));
    }

    const normalizedChatId = normalizeChatId(chatId);

    // Check if loggedInUserId is the session owner (admin)
    const ownerCheck = await pool.query(
      'SELECT 1 FROM whatsapp_sections WHERE "number" = $1 AND "userId" = $2 LIMIT 1',
      [sessionId, loggedInUserId]
    );
    const isAdmin = ownerCheck.rows.length > 0;

    // If not admin, they can only get their own notes
    if (!isAdmin && targetUserId !== loggedInUserId) {
      return next(new AppError("Unauthorized to access other user's notes", 403));
    }

    const result = await pool.query(
      'SELECT notes FROM chat_notes WHERE "sessionId" = $1 AND "chatId" = $2 AND "userId" = $3',
      [sessionId, normalizedChatId, targetUserId]
    );

    const notes = result.rows.length > 0 ? result.rows[0].notes : "";
    return res.json({ success: true, notes });
  } catch (error) {
    console.error("Get chat notes error:", error);
    return next(new AppError("Failed to fetch notes", 500));
  }
};

export const saveChatNotes = async (req, res, next) => {
  try {
    const { sessionId, chatId, notes, userId } = req.body;
    const loggedInUserId = req.userId;
    const targetUserId = userId || loggedInUserId;

    if (!sessionId || !chatId) {
      return next(new AppError("Missing sessionId or chatId", 400));
    }

    const normalizedChatId = normalizeChatId(chatId);

    // Check if loggedInUserId is the session owner (admin)
    const ownerCheck = await pool.query(
      'SELECT 1 FROM whatsapp_sections WHERE "number" = $1 AND "userId" = $2 LIMIT 1',
      [sessionId, loggedInUserId]
    );
    const isAdmin = ownerCheck.rows.length > 0;

    // If not admin, they can only save their own notes
    if (!isAdmin && targetUserId !== loggedInUserId) {
      return next(new AppError("Unauthorized to save other user's notes", 403));
    }

    await pool.query(
      `INSERT INTO chat_notes ("sessionId", "chatId", "userId", notes, "updatedBy")
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT ("sessionId", "chatId", "userId")
       DO UPDATE SET notes = EXCLUDED.notes, "updatedBy" = EXCLUDED."updatedBy", "updatedAt" = CURRENT_TIMESTAMP`,
      [sessionId, normalizedChatId, targetUserId, notes || "", loggedInUserId]
    );

    // Emit notes-updated to active session room
    const io = req.app.get("io");
    if (io) {
      io.to(`session_${sessionId}`).emit("notes-updated", { 
        sessionId, 
        chatId: normalizedChatId, 
        userId: targetUserId,
        notes 
      });
    }

    return res.json({ success: true, message: "Notes saved successfully" });
  } catch (error) {
    console.error("Save chat notes error:", error);
    return next(new AppError("Failed to save notes", 500));
  }
};

export const getChatNotesUsers = async (req, res, next) => {
  try {
    const { sessionId, chatId } = req.params;
    const loggedInUserId = req.userId;

    if (!sessionId || !chatId) {
      return next(new AppError("Missing sessionId or chatId", 400));
    }

    const normalizedChatId = normalizeChatId(chatId);

    // Verify if loggedInUserId is the session owner (admin)
    const ownerCheck = await pool.query(
      'SELECT 1 FROM whatsapp_sections WHERE "number" = $1 AND "userId" = $2 LIMIT 1',
      [sessionId, loggedInUserId]
    );
    const isAdmin = ownerCheck.rows.length > 0;

    if (!isAdmin) {
      return next(new AppError("Unauthorized. Only the administrator can view all notes users.", 403));
    }

    // Query distinct users who:
    // 1. Are the session owner (admin)
    // 2. Are currently assigned to this chat
    // 3. Have written a note for this chat
    const query = `
      SELECT DISTINCT u._id, u.name, u.email,
        CASE WHEN ws._id IS NOT NULL THEN true ELSE false END as "isAdmin",
        CASE WHEN ca._id IS NOT NULL THEN true ELSE false END as "isAssigned"
      FROM users u
      LEFT JOIN whatsapp_sections ws ON (ws."userId" = u._id AND ws."number" = $1)
      LEFT JOIN chat_assignments ca ON (ca."assignedTo" = u._id AND ca."sessionId" = $1 AND ca."chatId" = $2)
      LEFT JOIN chat_notes cn ON (cn."userId" = u._id AND cn."sessionId" = $1 AND cn."chatId" = $2)
      WHERE ws._id IS NOT NULL OR ca._id IS NOT NULL OR cn._id IS NOT NULL
      ORDER BY "isAdmin" DESC, u.name ASC
    `;
    const result = await pool.query(query, [sessionId, normalizedChatId]);
    return res.json({ success: true, users: result.rows });
  } catch (error) {
    console.error("Get chat notes users error:", error);
    return next(new AppError("Failed to fetch notes users", 500));
  }
};

import pool from "../../config/db.js";

export const saveMessage = async (messageData) => {
  const {
    sessionId,
    whatsappId,
    from,
    to,
    body,
    chatId,
    type,
    fromMe,
    timestamp,
    rawData,
    author,
  } = messageData;

  // 🔥 Skip broadcast and newsletters
  if (
    from?.includes("status@broadcast") ||
    to?.includes("status@broadcast") ||
    from?.includes("@newsletter") ||
    to?.includes("@newsletter")
  ) {
    return null;
  }

  const isGroup = from?.includes("@g.us") || to?.includes("@g.us");
  const tableName = isGroup ? "group_messages" : "personal_messages";
  const linkingColumn = isGroup ? "groupMessageId" : "personalMessageId";

  try {
    // 1. Resolve userId from sessionId (number)
    const sectionQuery = `SELECT "userId" FROM whatsapp_sections WHERE "number" = $1 LIMIT 1`;
    const { rows: sectionRows } = await pool.query(sectionQuery, [sessionId]);
    const userId = sectionRows.length > 0 ? sectionRows[0].userId : null;

    // 2. Save to specific table (personal or group)
    let specificQuery;
    let specificValues;

    if (isGroup) {
      specificQuery = `
        INSERT INTO group_messages ("from", "to", "chatId", "author", body, "type", "fromMe", timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING _id;
      `;
      specificValues = [from, to, chatId, author || null, body, type, fromMe, timestamp];
    } else {
      specificQuery = `
        INSERT INTO personal_messages ("from", "to", "chatId", body, "type", "fromMe", timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING _id;
      `;
      specificValues = [from, to, chatId, body, type, fromMe, timestamp];
    }

    const { rows: specificRows } = await pool.query(specificQuery, specificValues);
    const messageRecordId = specificRows.length > 0 ? specificRows[0]._id : null;

    // 3. Save to master linking table
    const masterQuery = `
      INSERT INTO messages ("sessionId", "userId", "${linkingColumn}", "whatsappId", "rawData")
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT ("whatsappId") DO NOTHING
      RETURNING *;
    `;
    const masterValues = [
      sessionId,
      userId,
      messageRecordId,
      whatsappId,
      rawData ? (() => { try { return JSON.stringify(rawData); } catch { return null; } })() : null,
    ];
    const { rows: masterRows } = await pool.query(masterQuery, masterValues);

    // 🔥 CRITICAL: ON CONFLICT DO NOTHING returns empty rows — fetch existing _id
    let masterId = masterRows.length > 0 ? masterRows[0]._id : null;
    if (!masterId) {
      const existing = await pool.query(
        `SELECT _id FROM messages WHERE "whatsappId" = $1`,
        [whatsappId]
      );
      masterId = existing.rows[0]?._id || null;
    }

    return {
      masterId,
      sessionId,
      whatsappId,
      from,
      to,
      body,
      type,
      fromMe,
      timestamp,
      isGroup,
    };
  } catch (err) {
    console.error(`❌ Save message error:`, err.message);
    throw err;
  }
};

/**
 * Save media metadata to media_files table.
 * Called after a media file has been saved to disk.
 */
export const saveMedia = async ({ masterId, mediaType, mimeType, publicUrl, localPath, fileName, fileSize, caption }) => {
  try {
    const query = `
      INSERT INTO media_files ("messageId", "mediaType", "mimeType", "publicUrl", "localPath", "fileName", "fileSize", "caption")
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    const values = [masterId, mediaType, mimeType, publicUrl, localPath, fileName, fileSize || null, caption || null];
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    console.error(`❌ Save media error:`, err.message);
    throw err;
  }
};

export const getContactsWithMessages = async (sessionId) => {
  const query = `
    WITH UnifiedMessages AS (

      -- Personal chat messages
      SELECT 
        m."sessionId",
        sd."fromMe",
        sd."to",
        sd."from",
        sd.body,
        sd."type",
        mf.caption,
        sd.timestamp,
        sd."chatId",
        sd."isGroup"
      FROM messages m
      JOIN personal_messages sd
        ON sd._id = m."personalMessageId"
      LEFT JOIN media_files mf 
        ON mf."messageId" = m._id

      UNION ALL

      -- Group messages
      SELECT 
        m."sessionId",
        sd."fromMe",
        sd."to",
        sd."from",
        sd.body,
        sd."type",
        mf.caption,
        sd.timestamp,
        sd."chatId",
        sd."isGroup"
      FROM messages m
      JOIN group_messages sd
        ON sd._id = m."groupMessageId"
      LEFT JOIN media_files mf 
        ON mf."messageId" = m._id
    ),

    LastMessages AS (
      SELECT 
        CASE 
          WHEN "fromMe" = true THEN "to"
          ELSE "from"
        END AS "contactId",

        body,
        "type",
        caption,
        timestamp,
        "fromMe",
        "chatId",
        "isGroup",

        ROW_NUMBER() OVER (
          PARTITION BY 
            CASE 
              WHEN "fromMe" = true THEN "to"
              ELSE "from"
            END
          ORDER BY timestamp DESC
        ) AS rn

      FROM UnifiedMessages

      WHERE "sessionId" = $1
        AND "from" NOT LIKE '%status@broadcast%'
        AND "to" NOT LIKE '%status@broadcast%'
        AND "from" NOT LIKE '%@newsletter%'
        AND "to" NOT LIKE '%@newsletter%'
    )

    SELECT 
      lm."contactId",
      lm.body,
      lm."type",
      lm.caption,
      lm.timestamp,
      lm."fromMe",
      lm."chatId",
      lm."isGroup",

      COALESCE(
        c1.name,
        c2.name,
        lm."contactId"
      ) AS "name"

    FROM LastMessages lm

    LEFT JOIN contacts c1
      ON c1."whatsappId" = lm."contactId"

    LEFT JOIN contacts c2
      ON c2.lid = lm."contactId"

    WHERE lm.rn = 1

    ORDER BY lm.timestamp DESC;
  `;

  const values = [sessionId];
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getMessagesBySessionAndContact = async (
  sessionId,
  contactWhatsappId,
) => {
  const cleanId = contactWhatsappId.split("@")[0];
  const isGroup = contactWhatsappId.includes("@g.us");
  const tableName = isGroup ? "group_messages" : "personal_messages";
  const linkingColumn = isGroup ? "groupMessageId" : "personalMessageId";

  const query = `
    SELECT 
      m._id as master_id,
      sd.*,
      mf."publicUrl",
      mf."mediaType",
      mf."mimeType",
      mf."fileName",
      mf."fileSize",
      mf."caption"
    FROM messages m
    JOIN ${tableName} sd ON sd._id = m."${linkingColumn}"
    LEFT JOIN media_files mf ON mf."messageId" = m._id
    LEFT JOIN contacts c ON (c."whatsappId" = $2 OR c.lid = $2)
    WHERE m."sessionId" = $1 
      AND (
        sd."from" = $2 OR sd."to" = $2 OR 
        sd."from" = c."whatsappId" OR sd."to" = c."whatsappId" OR
        sd."from" = c.lid OR sd."to" = c.lid OR
        sd."from" = $3 OR sd."to" = $3 OR
        sd."from" LIKE $4 OR sd."to" LIKE $4
      )
    ORDER BY sd.timestamp ASC;
  `;
  const values = [sessionId, contactWhatsappId, cleanId, `${cleanId}@%`];
  const { rows } = await pool.query(query, values);
  return rows;
};

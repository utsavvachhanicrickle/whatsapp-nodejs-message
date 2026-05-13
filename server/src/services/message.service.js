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
  const tableName = isGroup ? "group_messages" : "chat_messages";
  const linkingColumn = isGroup ? "groupMessageId" : "chatMessageId";

  try {
    // 1. Resolve userId from sessionId (number)
    const sectionQuery = `SELECT "userId" FROM whatsapp_sections WHERE "number" = $1 LIMIT 1`;
    const { rows: sectionRows } = await pool.query(sectionQuery, [sessionId]);
    const userId = sectionRows.length > 0 ? sectionRows[0].userId : null;

    // 2. Save to specific table
    const specificQuery = `
      INSERT INTO ${tableName} ( "from", "to","chatId", body, "type", "fromMe", timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING _id;
    `;
    const specificValues = [from, to, chatId, body, type, fromMe, timestamp];
    const { rows: specificRows } = await pool.query(
      specificQuery,
      specificValues,
    );

    // If it was a duplicate, we might need to find the existing ID
    let messageRecordId = specificRows.length > 0 ? specificRows[0]._id : null;
    if (!messageRecordId) {
      const existingRows = await pool.query(
        `SELECT _id FROM ${tableName} WHERE "whatsappId" = $1`,
        [whatsappId],
      );
      messageRecordId = existingRows.rows[0]?._id;
    }

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
      rawData ? JSON.stringify(rawData) : null,
    ];
    const { rows: masterRows } = await pool.query(masterQuery, masterValues);

    // For backward compatibility, return an object that looks like the old message structure
    return {
      sessionId,
      whatsappId,
      from,
      to,
      body,
      type,
      fromMe,
      timestamp,
      rawData,
    };
  } catch (err) {
    console.error(`❌ Save message polymorphic error:`, err.message);
    throw err;
  }
};

export const getMessagesBySessionAndContact = async (
  sessionId,
  contactWhatsappId,
) => {
  // Normalize the input ID
  const cleanId = contactWhatsappId.split("@")[0];
  const isGroup = contactWhatsappId.includes("@g.us");
  const tableName = isGroup ? "group_messages" : "chat_messages";
  const linkingColumn = isGroup ? "groupMessageId" : "chatMessageId";

  const query = `
    SELECT 
      m._id as master_id,
      sd.*
    FROM messages m
    JOIN ${tableName} sd ON sd._id = m."${linkingColumn}"
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

export const getContactsWithMessages = async (sessionId) => {
  const query = `
    WITH UnifiedMessages AS (
      SELECT m."sessionId", sd."fromMe", sd."to", sd."from", sd.body, sd.timestamp 
      FROM messages m
      JOIN chat_messages sd ON sd._id = m."chatMessageId"
      UNION ALL
      SELECT m."sessionId", sd."fromMe", sd."to", sd."from", sd.body, sd.timestamp 
      FROM messages m
      JOIN group_messages sd ON sd._id = m."groupMessageId"
    ),
    LastMessages AS (
      SELECT 
        CASE WHEN "fromMe" = true THEN "to" ELSE "from" END as "contactId",
        body,
        timestamp,
        "fromMe",
        ROW_NUMBER() OVER(PARTITION BY CASE WHEN "fromMe" = true THEN "to" ELSE "from" END ORDER BY timestamp DESC) as rn
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
      lm.timestamp, 
      lm."fromMe",
      COALESCE(c1.name, c2.name, lm."contactId") as "name"
    FROM LastMessages lm
    LEFT JOIN contacts c1 ON c1."whatsappId" = lm."contactId"
    LEFT JOIN contacts c2 ON c2.lid = lm."contactId"
    WHERE lm.rn = 1
    ORDER BY lm.timestamp DESC;
  `;
  const values = [sessionId];
  const { rows } = await pool.query(query, values);
  return rows;
};

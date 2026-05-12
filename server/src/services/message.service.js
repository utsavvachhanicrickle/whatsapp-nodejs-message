import pool from "../../config/db.js";

export const saveMessage = async (messageData) => {
  const { sessionId, whatsappId, from, to, body, type, fromMe, timestamp } =
    messageData;

  // 🔥 Skip broadcast and newsletters
  if (
    from?.includes("status@broadcast") ||
    to?.includes("status@broadcast") ||
    from?.includes("@newsletter") ||
    to?.includes("@newsletter")
  ) {
    return null;
  }

  try {
    const query = `
      INSERT INTO messages ("sessionId", "whatsappId", "from", "to", body, "type", "fromMe", timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT ("whatsappId") DO NOTHING
      RETURNING *;
    `;
    const values = [
      sessionId,
      whatsappId,
      from,
      to,
      body,
      type,
      fromMe,
      timestamp,
    ];
    const { rows } = await pool.query(query, values);
    return rows[0];
  } catch (err) {
    // Fallback if ON CONFLICT fails (e.g. unique constraint missing)
    if (err.code === "42P10") {
      // undefined_column / missing index for conflict
      const query = `
        INSERT INTO messages ("sessionId", "whatsappId", "from", "to", body, "type", "fromMe", timestamp)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
      `;
      const values = [
        sessionId,
        whatsappId,
        from,
        to,
        body,
        type,
        fromMe,
        timestamp,
      ];
      const { rows } = await pool.query(query, values);
      return rows[0];
    }
    throw err;
  }
};




export const getMessagesBySessionAndContact = async (
  sessionId,
  contactWhatsappId,
) => {
  // Normalize the input ID
  const cleanId = contactWhatsappId.split("@")[0];

  const query = `
    SELECT m.* 
    FROM messages m
    LEFT JOIN contacts c ON (c."whatsappId" = $2 OR c.lid = $2)
    WHERE m."sessionId" = $1 
      AND (
        m."from" = $2 OR m."to" = $2 OR 
        m."from" = c."whatsappId" OR m."to" = c."whatsappId" OR
        m."from" = c.lid OR m."to" = c.lid OR
        m."from" = $3 OR m."to" = $3 OR
        m."from" LIKE $4 OR m."to" LIKE $4
      )
    ORDER BY m.timestamp ASC;
  `;
  const values = [sessionId, contactWhatsappId, cleanId, `${cleanId}@%`];
  const { rows } = await pool.query(query, values);
  return rows;
};

export const getContactsWithMessages = async (sessionId) => {
  const query = `
    WITH LastMessages AS (
      SELECT 
        CASE WHEN "fromMe" = true THEN "to" ELSE "from" END as "contactId",
        body,
        timestamp,
        "fromMe",
        ROW_NUMBER() OVER(PARTITION BY CASE WHEN "fromMe" = true THEN "to" ELSE "from" END ORDER BY timestamp DESC) as rn
      FROM messages
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
      COALESCE(c1.name, c2.name) as "name"
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


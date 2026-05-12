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
    console.log(rows);

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
  // Normalize the input ID to ensure we match both with and without suffix
  const cleanId = contactWhatsappId.split("@")[0];

  const query = `
    SELECT * FROM messages 
    WHERE "sessionId" = $1 
      AND (
        "from" = $2 OR "to" = $2 OR 
        "from" = $3 OR "to" = $3 OR
        "from" LIKE $4 OR "to" LIKE $4
      )
    ORDER BY timestamp ASC;
  `;
  // $2: raw ID, $3: clean ID, $4: clean ID with prefix match
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
    SELECT "contactId", body, timestamp, "fromMe"
    FROM LastMessages
    WHERE rn = 1
    ORDER BY timestamp DESC;
  `;
  const values = [sessionId];
  const { rows } = await pool.query(query, values);
  return rows;
};

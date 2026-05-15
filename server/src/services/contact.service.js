import pool from '../../config/db.js';

export const getContactByPhoneAndUserId = async (phoneNumber, userId) => {
  const result = await pool.query(
    'SELECT * FROM contacts WHERE "phoneNumber" = $1 AND "userId" = $2',
    [phoneNumber, userId]
  );
  return result.rows[0];
};

export const createContact = async (name, phoneNumber, userId, sessionId) => {
  const result = await pool.query(
    'INSERT INTO contacts (name, "phoneNumber", "userId", "sessionId") VALUES ($1, $2, $3, $4) RETURNING *',
    [name, phoneNumber, userId, sessionId]
  );
  return result.rows[0];
};

export const getContactsByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM contacts WHERE "userId" = $1 ORDER BY "createdAt" DESC',
    [userId]
  );
  return result.rows;
};

export const deleteContactByIdAndUserId = async (id, userId) => {
  const result = await pool.query(
    'DELETE FROM contacts WHERE _id = $1 AND "userId" = $2 RETURNING *',
    [id, userId]
  );
  return result.rows[0];
};

export const updateContactByIdAndUserId = async (id, userId, name, phoneNumber) => {
  const result = await pool.query(
    'UPDATE contacts SET name = $1, "phoneNumber" = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE _id = $3 AND "userId" = $4 RETURNING *',
    [name, phoneNumber, id, userId]
  );
  return result.rows[0];
};

export const insertManyContacts = async (contactsData) => {
  if (contactsData.length === 0) return [];
  
  const CHUNK_SIZE = 100;
  const results = [];

  for (let i = 0; i < contactsData.length; i += CHUNK_SIZE) {
    const chunk = contactsData.slice(i, i + CHUNK_SIZE);
    const values = [];
    let queryStr = 'INSERT INTO contacts (name, "phoneNumber", "userId", "sessionId") VALUES ';
    
    chunk.forEach((c, index) => {
      queryStr += `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4}),`;
      values.push(c.name, c.phoneNumber, c.userId, c.sessionId);
    });
    
    queryStr = queryStr.slice(0, -1) + ' RETURNING *';
    const result = await pool.query(queryStr, values);
    results.push(...result.rows);
  }
  
  return results;
};

export const getContactsByPhonesAndUserId = async (phoneNumbers, userId) => {
  if (phoneNumbers.length === 0) return [];
  const result = await pool.query(
    'SELECT "phoneNumber" FROM contacts WHERE "userId" = $1 AND "phoneNumber" = ANY($2::varchar[])',
    [userId, phoneNumbers]
  );
  return result.rows;
};

export const deleteManyContacts = async (ids, userId) => {
  if (ids.length === 0) return 0;
  const result = await pool.query(
    'DELETE FROM contacts WHERE "userId" = $1 AND _id = ANY($2::uuid[])',
    [userId, ids]
  );
  return result.rowCount;
};

export const upsertWhatsappContacts = async (contactsData) => {
  if (contactsData.length === 0) return [];

  const CHUNK_SIZE = 100;
  const results = [];

  for (let i = 0; i < contactsData.length; i += CHUNK_SIZE) {
    const chunk = contactsData.slice(i, i + CHUNK_SIZE);
    const values = [];
    let queryStr = 'INSERT INTO contacts (name, "phoneNumber", "userId", "whatsappId", "pushName", lid, "sessionId") VALUES ';


    chunk.forEach((c, index) => {
      queryStr += `($${index * 7 + 1}, $${index * 7 + 2}, $${index * 7 + 3}, $${index * 7 + 4}, $${index * 7 + 5}, $${index * 7 + 6}, $${index * 7 + 7}),`;
      values.push(c.name || null, c.phoneNumber, c.userId, c.whatsappId, c.pushName || null, c.lid || null, c.sessionId);
    });

    queryStr = queryStr.slice(0, -1) + 
      ' ON CONFLICT ("phoneNumber", "userId", "sessionId") DO UPDATE SET ' +
      '"whatsappId" = EXCLUDED."whatsappId", ' +
      '"lid" = EXCLUDED."lid", ' +
      '"pushName" = EXCLUDED."pushName", ' +
      '"updatedAt" = CURRENT_TIMESTAMP RETURNING *';


    const result = await pool.query(queryStr, values);
    results.push(...result.rows);
  }

  return results;
};

export const deleteContactsByUserIdAndSessionId = async (userId, sessionId) => {
  const result = await pool.query(
    'DELETE FROM contacts WHERE "userId" = $1 AND "sessionId" = $2',
    [userId, sessionId]
  );
  return result.rowCount;
};

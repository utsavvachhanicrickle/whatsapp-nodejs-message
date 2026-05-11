import pool from '../../config/db.js';

export const getContactByPhoneAndUserId = async (phoneNumber, userId) => {
  const result = await pool.query(
    'SELECT * FROM contacts WHERE "phoneNumber" = $1 AND "userId" = $2',
    [phoneNumber, userId]
  );
  return result.rows[0];
};

export const createContact = async (name, phoneNumber, userId) => {
  const result = await pool.query(
    'INSERT INTO contacts (name, "phoneNumber", "userId") VALUES ($1, $2, $3) RETURNING *',
    [name, phoneNumber, userId]
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
  
  const values = [];
  let queryStr = 'INSERT INTO contacts (name, "phoneNumber", "userId") VALUES ';
  
  contactsData.forEach((c, index) => {
    queryStr += `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3}),`;
    values.push(c.name, c.phoneNumber, c.userId);
  });
  
  queryStr = queryStr.slice(0, -1) + ' RETURNING *';
  
  const result = await pool.query(queryStr, values);
  return result.rows;
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

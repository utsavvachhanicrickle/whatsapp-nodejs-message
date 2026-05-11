import pool from '../../config/db.js';

export const createDefaultMessage = async (title, message, userId) => {
  const result = await pool.query(
    'INSERT INTO default_messages (title, message, "userId") VALUES ($1, $2, $3) RETURNING *',
    [title, message, userId]
  );
  return result.rows[0];
};

export const getDefaultMessagesByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM default_messages WHERE "userId" = $1 ORDER BY "createdAt" DESC',
    [userId]
  );
  return result.rows;
};

export const deleteDefaultMessageByIdAndUserId = async (id, userId) => {
  const result = await pool.query(
    'DELETE FROM default_messages WHERE _id = $1 AND "userId" = $2 RETURNING *',
    [id, userId]
  );
  return result.rows[0];
};

export const updateDefaultMessageByIdAndUserId = async (id, userId, title, message) => {
  const result = await pool.query(
    'UPDATE default_messages SET title = $1, message = $2, "updatedAt" = CURRENT_TIMESTAMP WHERE _id = $3 AND "userId" = $4 RETURNING *',
    [title, message, id, userId]
  );
  return result.rows[0];
};

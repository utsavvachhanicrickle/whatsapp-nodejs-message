import pool from '../../config/db.js';

export const createUser = async ({ name, email, password }) => {
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *',
    [name, email, password]
  );
  return result.rows[0];
};

export const getUserByEmail = async (email) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

export const getUserById = async (id) => {
  const result = await pool.query('SELECT * FROM users WHERE _id = $1', [id]);
  return result.rows[0];
};

export const updateUserRefreshToken = async (id, refreshToken) => {
  const result = await pool.query(
    'UPDATE users SET "refreshToken" = $1 WHERE _id = $2 RETURNING *',
    [refreshToken, id]
  );
  return result.rows[0];
};

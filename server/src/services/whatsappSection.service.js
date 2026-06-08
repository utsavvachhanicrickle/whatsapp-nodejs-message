import pool from "../../config/db.js";

export const createWhatsappSection = async (number, userId) => {
  const result = await pool.query(
    'INSERT INTO whatsapp_sections (number, "userId") VALUES ($1, $2) RETURNING *',
    [number, userId]
  );
  return result.rows[0];
};

export const getWhatsappSectionsByUserId = async (userId) => {
  const result = await pool.query(
    'SELECT * FROM whatsapp_sections WHERE "userId" = $1',
    [userId]
  );
  return result.rows;
};

export const getWhatsappSectionByNumber = async (number) => {
  const result = await pool.query(
    'SELECT * FROM whatsapp_sections WHERE number = $1',
    [number]
  );
  return result.rows[0];
};

export const deleteWhatsappSectionByNumberAndUserId = async (number, userId) => {
  const result = await pool.query(
    'DELETE FROM whatsapp_sections WHERE number = $1 AND "userId" = $2 RETURNING *',
    [number, userId]
  );
  return result.rows[0];
};

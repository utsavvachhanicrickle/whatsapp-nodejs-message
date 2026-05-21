import pool from '../../config/db.js';

export const getDefaultKeywordsServices = async (sessionId, userId) => {
    const result = await pool.query(
        'SELECT * FROM default_keywords WHERE "sessionId" = $1 AND "userId" = $2',
        [sessionId, userId]
    );
    return result.rows;
}

export const addDefaultKeywordsServices = async (sessionId, userId, defaultKeyword) => {
    const result = await pool.query(
        'INSERT INTO default_keywords ("sessionId", "userId", defaultkeyword) VALUES ($1, $2, $3) RETURNING *',
        [sessionId, userId, defaultKeyword]
    );
    return result.rows[0];
}

export const updateDefaultKeywordServices = async (sessionId, userId, defaultKeyword, id) => {
    const result = await pool.query(
        'UPDATE default_keywords SET "defaultkeyword" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "sessionId" = $2 AND "userId" = $3 AND "_id" = $4 RETURNING *',
        [defaultKeyword, sessionId, userId, id]
    );
    return result.rows[0];
}

export const deleteDefaultKeywordServices = async (sessionId, userId, id) => {
    const result = await pool.query(
        'DELETE FROM default_keywords WHERE "sessionId" = $1 AND "userId" = $2 AND "_id" = $3 RETURNING *',
        [sessionId, userId, id]
    );
    return result.rows[0];
}
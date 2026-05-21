import pool from "../../config/db.js"

export const getDefaultKeywordsMessagesServices = async (sessionId, userId) => {
    const result = await pool.query(
        'SELECT * FROM default_keywords_messages WHERE "sessionId" = $1 AND "userId" = $2',
        [sessionId, userId]
    )
    return result.rows;
}

export const addDefaultKeywordsMessagesServices = async (sessionId, userId, defaulWordsMessages) => {
    const result = await pool.query(
        'INSERT INTO default_keywords_messages ("sessionId", "userId", defaulWordsMessages) VALUES ($1,$2,$3) RETURNING *',
        [sessionId, userId, defaulWordsMessages]
    )
    return result.rows[0];
}

export const updateDefaultKeywordsMessagesServices = async (sessionId, userId, defaulWordsMessages, id) => {
    const result = await pool.query(
        'UPDATE default_keywords_messages set defaulWordsMessages= $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "sessionId" = $2 AND "userId" = $3 AND "_id" = $4 RETURNING *',
        [defaulWordsMessages, sessionId, userId, id]
    )
    return result.rows[0];
}

export const deleteDefaultKeywordMessageServices = async (sessionId, userId, id) => {
    const result = await pool.query(
        'DELETE FROM default_keywords_messages WHERE "sessionId" = $1 AND "userId" = $2 AND "_id" = $3 RETURNING *'
        [sessionId, userId, id]
    )
    return result.rows[0]
}

export const starDefaultKeywordMessageServices = async (sessionId, userId, id) => {
    const result = await pool.query(
        'UPDATE default_keywords_messages set "is_starred" = true where "sessionId" = $1 AND "userId" = $2 AND "_id" = $3 RETURNING *',
        [sessionId, userId, id]
    )
    return result.rows[0]
}
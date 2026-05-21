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

export const deleteDefaultKeywordMessageServices = async (
    sessionId,
    userId,
    id
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Find deleting row
        const findQuery = await client.query(
            `SELECT * FROM default_keywords_messages
       WHERE "sessionId" = $1
       AND "userId" = $2
       AND "_id" = $3`,
            [sessionId, userId, id]
        );

        const deletingRow = findQuery.rows[0];

        if (!deletingRow) {
            await client.query("ROLLBACK");
            return null;
        }

        // Delete row
        const deleteQuery = await client.query(
            `DELETE FROM default_keywords_messages
       WHERE "sessionId" = $1
       AND "userId" = $2
       AND "_id" = $3
       RETURNING *`,
            [sessionId, userId, id]
        );

        // If deleted row was starred
        if (deletingRow.is_starred) {
            // Pick another row and star it
            const nextRow = await client.query(
                `SELECT _id
         FROM default_keywords_messages
         WHERE "sessionId" = $1
         AND "userId" = $2
         LIMIT 1`,
                [sessionId, userId]
            );

            if (nextRow.rows.length > 0) {
                await client.query(
                    `UPDATE default_keywords_messages
           SET "is_starred" = true
           WHERE "_id" = $1`,
                    [nextRow.rows[0]._id]
                );
            }
        }

        await client.query("COMMIT");

        return deleteQuery.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};

export const starDefaultKeywordMessageServices = async (
    sessionId,
    userId,
    id
) => {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        // Unstar all rows
        await client.query(
            `UPDATE default_keywords_messages
       SET "is_starred" = false
       WHERE "sessionId" = $1
       AND "userId" = $2`,
            [sessionId, userId]
        );

        // Star selected row
        const result = await client.query(
            `UPDATE default_keywords_messages
       SET "is_starred" = true
       WHERE "sessionId" = $1
       AND "userId" = $2
       AND "_id" = $3
       RETURNING *`,
            [sessionId, userId, id]
        );

        await client.query("COMMIT");

        return result.rows[0];
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
};
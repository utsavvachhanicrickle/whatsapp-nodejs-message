import pkg from 'pg';
const { Pool } = pkg;

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});


export const connectionDB = async () => {
    try {
        const res = await pool.query('SELECT NOW()');
        console.log("PostgreSQL connected successfully at", res.rows[0].now);

        // 🚀 Auto-Initialize Database Schema
        const sqlPath = path.join(process.cwd(), 'db', 'init.sql');
        if (fs.existsSync(sqlPath)) {
            const sql = fs.readFileSync(sqlPath, 'utf8');
            await pool.query(sql);
            console.log("✅ Database schema is up to date.");
        }
    } catch (error) {
        console.error("PostgreSQL connection or initialization error:", error);
    }
};

export default pool;
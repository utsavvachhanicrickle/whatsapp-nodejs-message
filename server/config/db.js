import pkg from 'pg';
const { Pool } = pkg;
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
    } catch (error) {
        console.error("PostgreSQL is not connecting", error);
    }
};

export default pool;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runInitSql = async () => {
  try {
    const sqlPath = path.join(__dirname, 'db', 'init.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Running init.sql...');
    await pool.query(sql);
    console.log('Database tables created successfully!');
    
  } catch (error) {
    console.error('Error running init.sql:', error);
  } finally {
    pool.end();
  }
};

runInitSql();

import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runSeeders() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'supply_chain_finance',
    multipleStatements: true
  };

  console.log('🌱 Running seeders...\n');

  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to database\n');

    const seedersDir = path.join(__dirname, 'seeders');
    const files = fs.readdirSync(seedersDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`📄 Running seeder: ${file}`);
      const sql = fs.readFileSync(path.join(seedersDir, file), 'utf8');
      await connection.query(sql);
      console.log(`✅ Completed: ${file}\n`);
    }

    console.log('✅ All seeders completed successfully!');
  } catch (error) {
    console.error('❌ Seeder error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runSeeders();

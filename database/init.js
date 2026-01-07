const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function initDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  console.log('Connecting to MySQL server...');
  console.log(`Host: ${config.host}:${config.port}`);
  console.log(`User: ${config.user}`);

  let connection;

  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to MySQL server successfully!');

    console.log('\n--- Running schema.sql ---');
    const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await connection.query(schemaSQL);
    console.log('Schema created successfully!');

    console.log('\n--- Running seed.sql ---');
    const seedSQL = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf8');
    await connection.query(seedSQL);
    console.log('Seed data inserted successfully!');

    console.log('\n✓ Database initialization completed!');
    console.log('Database name: supply_chain_finance');
    console.log('Tables created: users, orders, risk_metrics');

  } catch (error) {
    console.error('Error initializing database:', error.message);
    console.error('\nPlease make sure:');
    console.error('1. MySQL server is running');
    console.error('2. Your credentials in .env file are correct');
    console.error('3. Your MySQL user has permission to create databases');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('\nConnection closed.');
    }
  }
}

require('dotenv').config();
initDatabase();

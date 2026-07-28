const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Required for Render PostgreSQL
  ssl: {
    rejectUnauthorized: false
  }
};

const databaseName = process.env.DB_NAME || 'smart_diary';

let pool;

async function getPool() {

  if (!pool) {

    pool = new Pool({
      ...dbConfig,
      database: databaseName,
    });

    pool.on('error', (err) => {
      console.error('Unexpected PostgreSQL pool error', err);
    });

  }

  return pool;
}


async function query(text, params) {

  const currentPool = await getPool();

  return currentPool.query(text, params);

}


async function initializeDatabase() {

  try {

    const currentPool = await getPool();

    console.log("Connected to PostgreSQL");

    // Optional: keep only if you want backend to ensure tables exist
    await currentPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

  } catch(error) {

    console.error("Database initialization failed:", error.message);
    throw error;

  }

}


module.exports = {
  query,
  initializeDatabase,
};
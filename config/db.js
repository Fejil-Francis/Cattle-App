const { Pool } = require('pg');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

const databaseName = process.env.DB_NAME || 'smart_dairy';
let pool;

async function ensureDatabaseExists() {
  const adminPool = new Pool({
    ...dbConfig,
    database: 'postgres',
  });

  try {
    const result = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [databaseName]);
    if (result.rowCount === 0) {
      await adminPool.query(`CREATE DATABASE ${databaseName}`);
    }
  } finally {
    await adminPool.end();
  }
}

async function getPool() {
  if (!pool) {
    await ensureDatabaseExists();

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

async function initializeDatabase(maxRetries = 5, delayMs = 2000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      const currentPool = await getPool();

      const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL,
          email VARCHAR(100) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `;

      await currentPool.query(createTableQuery);
      return;
    } catch (error) {
      lastError = error;
      console.error(`Database initialization attempt ${attempt}/${maxRetries} failed:`, error.message);

      if (attempt === maxRetries) {
        throw lastError;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
}

module.exports = {
  query,
  initializeDatabase,
};

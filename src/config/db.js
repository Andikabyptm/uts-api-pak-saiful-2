require('dotenv').config();
const { Pool } = require('pg');

// Pool dibuat SATU kali di sini lalu dipakai bersama oleh semua repository.
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

pool.on('error', (err) => {
  console.error('Kesalahan pada koneksi database (idle client):', err.message);
});

module.exports = pool;
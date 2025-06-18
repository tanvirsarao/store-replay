const { Client } = require('pg');
require('dotenv').config();

const db = new Client({
  connectionString: process.env.DATABASE_URL,
});

const initDatabase = async () => {
  try {
    await db.connect();
    console.log('🟢 Connected to Supabase Postgres');
  } catch (err) {
    console.error('❌ Failed to connect to Supabase:', err);
  }
};

module.exports = { db, initDatabase };

// const { Client } = require('pg');
// require('dotenv').config();

// const db = new Client({
//   connectionString: process.env.DATABASE_URL,
// });

// const initDatabase = async () => {
//   try {
//     await db.connect();
//     console.log('🟢 Connected to Supabase Postgres');
//   } catch (err) {
//     console.error('❌ Failed to connect to Supabase:', err);
//   }
// };

// module.exports = { db, initDatabase };


const { Client } = require("pg");

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000,
});

let connected = false;

async function initDatabase() {
  if (connected) return;
  try {
    await db.connect();
    connected = true;
    console.log("🟢 Connected to Supabase Postgres");
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
}

module.exports = { db, initDatabase };

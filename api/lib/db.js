const { Client } = require("pg");

const parsedURL = new URL(process.env.DATABASE_URL);

const db = new Client({
  connectionString: process.env.DATABASE_URL,
  host: parsedURL.hostname, // ⬅️ This forces IPv4 instead of IPv6
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 10000,
});

let connected = false;

async function initDatabase() {
  if (connected) return;
  try {
    console.log("⏳ Connecting to Supabase Postgres...");
    await db.connect();
    connected = true;
    console.log("🟢 Connected to Supabase Postgres");
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
}

module.exports = { db, initDatabase };

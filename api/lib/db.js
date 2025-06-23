const { Client } = require("pg");
const { URL } = require("url");

const parsedURL = new URL(process.env.DATABASE_URL);

const db = new Client({
  user: parsedURL.username,
  password: parsedURL.password,
  host: parsedURL.hostname, // ✅ forces IPv4
  port: parseInt(parsedURL.port),
  database: parsedURL.pathname.slice(1),
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

///////////// health endpoint //////////////
// This endpoint is used to test the database connection and ensure the API is running correctly.
// It returns the current time from the database.

const express = require("express");
const router = express.Router();
const { db } = require("../lib/db");

router.get("/", async (req, res) => {
  console.log("🔍 /api/test route hit");
  try {
    const result = await db.query("SELECT NOW()");
    console.log("✅ DB query succeeded");
    res.status(200).json({ status: "ok", time: result.rows[0].now });
  } catch (err) {
    console.error("❌ Test DB query failed:", err);
    res.status(500).json({ error: "DB connection failed" });
  }
});


module.exports = router;

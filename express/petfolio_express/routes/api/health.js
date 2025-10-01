const express = require("express");
const router = express.Router();
const { HealthRecord } = require("../models/HealthRecord");

// 📥 GET: ดึงทั้งหมด (ต้องมี auth middleware ก่อน route นี้)
router.get("/", async (req, res) => {
  try {
    const records = await HealthRecord.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error("❌ GET /api/health error:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

module.exports = router;
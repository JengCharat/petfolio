// routes/health.js
const express = require("express");
const router = express.Router();
const HealthRecord = require("../models/HealthRecord");

// 📌 GET: ดึงทั้งหมด
router.get("/", async (req, res) => {
  try {
    const records = await HealthRecord.find()
      .populate("pet")
      .sort({ date: -1 });
    res.json(records);
  } catch (err) {
    console.error("❌ GET /api/health error:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

// ➕ POST: เพิ่ม
router.post("/", async (req, res) => {
  try {
    const newRecord = await HealthRecord.create(req.body);
    res.status(201).json(newRecord);
  } catch (err) {
    console.error("❌ POST /api/health error:", err);
    res.status(500).json({ error: "Failed to create record" });
  }
});

// ✏️ PUT: แก้ไข
router.put("/:id", async (req, res) => {
  try {
    const updated = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Record not found" });
    res.json(updated);
  } catch (err) {
    console.error("❌ PUT /api/health/:id error:", err);
    res.status(500).json({ error: "Failed to update record" });
  }
});

// ❌ DELETE: ลบ
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Record not found" });
    res.json({ message: `Deleted record ${req.params.id}` });
  } catch (err) {
    console.error("❌ DELETE /api/health/:id error:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

module.exports = router;
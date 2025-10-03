// routes/health.js
const express = require("express");
const router = express.Router();
const HealthRecord = require("../models/HealthRecord");
const Pet = require("../models/pet");
const User = require("../models/User"); // เพิ่ม import

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

// GET /api/health/user/:userId → ดึง health records ของ user คนเดียว
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Fetching records for userId:", userId);

    // หา user โดยใช้ field userId (string) แทน _id
    const user = await User.findOne({ userId: userId });
    if (!user) {
      console.error("User not found for userId:", userId);
      return res.status(404).json({ error: `User with ID ${userId} not found` });
    }

    // 🔹 ดึง health records ของ user โดยตรงจาก ownerUserId
    const records = await HealthRecord.find({ ownerUserId: userId })
      .populate("pet", "name type")
      .sort({ date: -1 });

    if (!records || records.length === 0) {
      console.warn("No health records found for userId:", userId);
      return res.status(404).json({ error: `No health records found for user ${userId}` });
    }

    console.log(`Found ${records.length} health records for userId:`, userId);
    res.json(records);

  } catch (err) {
    console.error("Error fetching health records for userId:", userId, err);
    res.status(500).json({
      error: "Failed to fetch records",
      details: err.message,
      stack: err.stack,
    });
  }
});




module.exports = router;
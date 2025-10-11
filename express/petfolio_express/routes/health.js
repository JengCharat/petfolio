const express = require("express");
const router = express.Router();
const HealthRecord = require("../models/HealthRecord");
const Pet = require("../models/pet");
const User = require("../models/User");

//  GET: ดึง health records ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const records = await HealthRecord.find()
      .populate("pet")
      .populate("owner", "username email")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error(" GET /api/health error:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});

//  POST: เพิ่ม health record
router.post("/", async (req, res) => {
  try {
    const { pet, type, date, clinic, detail, cost, ownerUserId } = req.body;

    // หา user object ก่อนจาก ownerUserId
    const user = await User.findOne({ userId: ownerUserId });
    if (!user) return res.status(404).json({ error: "User not found" });

    const newRecord = await HealthRecord.create({
      pet,
      type,
      date,
      clinic,
      detail,
      cost,
      owner: user._id,
      ownerUserId,
    });

    res.status(201).json(newRecord);
  } catch (err) {
    console.error(" POST /api/health error:", err);
    res.status(500).json({ error: "Failed to create record" });
  }
});


//  PUT: แก้ไข health record
router.put("/:id", async (req, res) => {
  try {
    const updated = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: "Record not found" });
    res.json(updated);
  } catch (err) {
    console.error(" PUT /api/health/:id error:", err);
    res.status(500).json({ error: "Failed to update record" });
  }
});

//  DELETE: ลบ health record
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await HealthRecord.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Record not found" });
    res.json({ message: `Deleted record ${req.params.id}` });
  } catch (err) {
    console.error(" DELETE /api/health/:id error:", err);
    res.status(500).json({ error: "Failed to delete record" });
  }
});

// GET /api/health/user/:userId → ดึง health records ของสัตว์เลี้ยงทั้งหมดที่ user เป็นเจ้าของ
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    console.log("Fetching health records for userId:", userId);

    // หา user object ก่อน
    const user = await User.findOne({ userId });
    if (!user) return res.status(404).json({ error: "User not found" });

    // หา pets ทั้งหมดที่เป็นของ user
    const pets = await Pet.find({ owner: user._id }).select("_id name type");
    const petIds = pets.map((p) => p._id);

    // หา health records ของ pets 
    const records = await HealthRecord.find({ pet: { $in: petIds } })
      .populate("pet", "name type breed")
      .sort({ date: -1 });

    res.json(records);
  } catch (err) {
    console.error(" Error fetching health records:", err);
    res.status(500).json({ error: "Failed to fetch records" });
  }
});


module.exports = router;

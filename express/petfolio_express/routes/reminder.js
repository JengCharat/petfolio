const express = require('express');
const router = express.Router();
const Reminder = require('../models/Reminder');

// ดึงข้อมูลกิจกรรมทั้งหมด (GET)
router.get('/', async (req, res) => {
  try {
    const reminders = await Reminder.find();
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// เพิ่มกิจกรรมใหม่ (POST)
router.post('/', async (req, res) => {
  const reminder = new Reminder({
    title: req.body.title,
    date: req.body.date,
    time: req.body.time,
    petId: req.body.petId, // <--- แก้ไขจาก petName เป็น petId
    details: req.body.details,
    userId: req.body.userId
  });

  try {
    const newReminder = await reminder.save();
    res.status(201).json(newReminder);
  } catch (err) {
    res.status(400).json({ message: err.message }); // 400 Bad Request
  }
});

router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    // ดึงข้อมูล reminders ของผู้ใช้ตาม userId และ populate ข้อมูลของสัตว์เลี้ยงจาก petId
    const reminders = await Reminder.find({ userId: userId }).populate("petId", "name type");
    res.json(reminders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
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
    petName: req.body.petName,
    details: req.body.details,
    userId: req.body.userId 
  });

  try {
    const newReminder = await reminder.save();
    res.status(201).json(newReminder);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get("/user/:userId", async (req, res) => {
    const { userId } = req.params;
    try {
        const reminders = await Reminder.find({ userId: userId }).populate("owner", "username email");
        res.json(reminders);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
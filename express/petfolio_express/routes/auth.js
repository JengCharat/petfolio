const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { nanoid } = require("nanoid");

const JWT_SECRET = 'supersecretkey'; // ใส่ env variable จริง ๆ

// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            if (existingUser.username === username) return res.status(400).json({ error: 'Username already taken' });
            if (existingUser.email === email) return res.status(400).json({ error: 'Email already registered' });
        }

        const userId = nanoid(); // สร้าง userId อัตโนมัติ
        const user = new User({ username, email, password, userId }); // ต้องเพิ่ม field userId ใน schema
        await user.save();
        res.status(201).json({ message: 'User created', userId }); // ส่ง userId กลับ frontend
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign(
      { userId: user.userId, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ token, userId: user.userId, username: user.username }); // ✅ ส่ง userId
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;

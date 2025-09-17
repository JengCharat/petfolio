const express = require("express");
const multer = require("multer");
const CommunityPost = require("../models/communityPost");
const Pet = require("../models/pet");
const User = require("../models/User");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { files: 4 } });

// สร้างโพสต์ใหม่
router.post("/", upload.array("images", 4), async (req, res) => {
  try {
    const { PostDesc, pets, owner } = req.body;

    // เช็ค user จริง
    const user = await User.findById(owner);
    if (!user) return res.status(400).json({ error: "User ไม่พบ" });

    // เช็ค pets ที่ส่งมาจาก user จริง
    let validPets = [];
    if (pets) {
      const petIds = Array.isArray(pets) ? pets : [pets];
      validPets = await Pet.find({ _id: { $in: petIds }, owner: owner });
    }

    const files = req.files;
    const imagePaths = files.map((file) => `/uploads/${file.filename}`);

    const post = new CommunityPost({
      PostDesc,
      images: imagePaths,
      pets: validPets.map((p) => p._id),
      owner: user._id,
    });

    await post.save();
    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "สร้างโพสต์ไม่สำเร็จ" });
  }
});

// ดึงโพสต์ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("pets")
      .populate("owner", "username");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "ดึงโพสต์ไม่สำเร็จ" });
  }
});

module.exports = router;

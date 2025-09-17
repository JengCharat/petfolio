const express = require("express");
const multer = require("multer");
const path = require("path");
const CommunityPost = require("../models/communityPost");
const Pet = require("../models/pet");
const User = require("../models/User");

const router = express.Router();

// Serve static folder สำหรับรูป
router.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { files: 4 } });

// 📌 สร้างโพสต์ใหม่
router.post("/", upload.array("images", 4), async (req, res) => {
  try {
    const { PostDesc, pets, owner } = req.body;

    // หา user ด้วย userId (string)
    const user = await User.findOne({ userId: owner });
    if (!user) return res.status(400).json({ error: "User not found" });

    // ตรวจสอบ pets ของ user
    let validPets = [];
    if (pets) {
      const petIds = Array.isArray(pets) ? pets : [pets];
      validPets = await Pet.find({
        _id: { $in: petIds },
        owner: user._id, // owner เป็น ObjectId
      });
    }

    const files = req.files || [];
    const imagePaths = files.map((file) => `/uploads/${file.filename}`);

    const post = new CommunityPost({
      PostDesc,
      images: imagePaths,
      pets: validPets.map((p) => p._id),
      owner: user._id, // เก็บ ObjectId ของ user
    });

    await post.save();

    // populate pets และ owner
    const populatedPost = await CommunityPost.findById(post._id)
      .populate("pets")
      .populate({ path: "owner", select: "username userId" });

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("❌ Error creating post:", err);
    res.status(500).json({ error: err.message });
  }
});

// 📌 ดึงโพสต์ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const posts = await CommunityPost.find()
      .populate("pets")
      .populate({ path: "owner", select: "username userId" });

    const postsWithUser = posts.map((post) => ({
      ...post.toObject(),
      ownerUsername: post.owner ? post.owner.username : "Unknown",
    }));

    res.json(postsWithUser);
  } catch (err) {
    console.error("❌ Error fetching posts:", err);
    res.status(500).json({ error: "ดึงโพสต์ไม่สำเร็จ" });
  }
});

module.exports = router;

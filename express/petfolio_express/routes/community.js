
const express = require("express");
const multer = require("multer");
const path = require("path");
const CommunityPost = require("../models/communityPost");
const Pet = require("../models/pet");
const User = require("../models/User");
const fs = require("fs");

const router = express.Router();

// Serve static folder สำหรับรูป
router.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/Post"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage, limits: { files: 4 } });

// 📌 สร้างโพสต์ใหม่
router.post("/", (req, res) => {
  // upload.array("images", 4) จะ limit ไฟล์สูงสุด 4
  upload.array("images", 4)(req, res, async (err) => {
    if (err) {
    if (err.code === "LIMIT_FILE_COUNT") {
      // ไฟล์เกิน 4
      return res.status(400).json({
        error: "คุณสามารถอัปโหลดได้สูงสุด 4 รูปเท่านั้น",
      });
    }
    // กรณีอื่น
    return res.status(500).json({ error: err.message });
  }

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
          owner: user._id,
        });
      }

      const files = req.files || [];
      const imagePaths = files.map((file) => `/uploads/Post/${file.filename}`);

      const post = new CommunityPost({
        PostDesc,
        images: imagePaths,
        pets: validPets.map((p) => p._id),
        owner: user._id,
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

// GET posts ของ user ตาม userId
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    // 1. หา user จาก userId
    const user = await User.findOne({ userId: userId }); // สมมติ field ใน User คือ userId
    if (!user) return res.status(404).json({ message: "User not found" });

    // 2. เอา _id ของ user เป็น ObjectId
    const ownerId = user._id;

    // 3. หาโพสต์โดย owner แล้วเรียงจากใหม่ → เก่า
    const posts = await CommunityPost.find({ owner: ownerId }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE post by id
router.delete("/:id", async (req, res) => {
  try {
    const postId = req.params.id;

    // หาโพสต์ก่อน
    const post = await CommunityPost.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // ถ้ามีรูปภาพในโพสต์ (หลายรูป)
    if (Array.isArray(post.images) && post.images.length > 0) {
      post.images.forEach((imgPath) => {
        // ✅ ดึงชื่อไฟล์ เช่น "abc.jpg"
        const fileName = path.basename(imgPath);

        // ✅ ชี้ตรงไปยังโฟลเดอร์ที่เก็บรูป
        const filePath = path.join(
          process.cwd(),
          
          "uploads",
          "Post",
          fileName
        );

        console.log("🟡 Trying to delete:", filePath);

        // ✅ ลบไฟล์จริง
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error("❌ Error deleting image:", err.message);
          } else {
            console.log("✅ Deleted image:", filePath);
          }
        });
      });
    }

    // ลบโพสต์ออกจาก DB
    await CommunityPost.findByIdAndDelete(postId);

    res.json({ message: "Post and all images deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;

// models/CommunityPost.js
const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  PostDesc: { type: String, required: true },
  images: [{ type: String }], // เก็บ path หรือ URL ของรูป

  // อ้างอิง Pet ที่สร้างไว้
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }],

  likes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: { type: Date, default: Date.now },

  // สามารถเพิ่ม owner ถ้าต้องการเชื่อม User
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);

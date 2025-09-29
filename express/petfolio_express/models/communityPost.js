const mongoose = require("mongoose");

const communityPostSchema = new mongoose.Schema({
  PostDesc: { type: String, required: true },
  images: [{ type: String }], 
  pets: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pet" }], 
  likes: { type: Number, default: 0 },
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "communityComment" }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // เชื่อม User
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("CommunityPost", communityPostSchema);

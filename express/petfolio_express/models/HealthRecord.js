const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    type: { type: String, required: true },
    date: { type: String, required: true },
    clinic: { type: String },
    detail: { type: String },
    cost: { type: Number, default: 0 },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ownerUserId: { type: String, required: true }, // string id สำหรับ query
  },
  { timestamps: true }
);

module.exports = mongoose.model("HealthRecord", healthRecordSchema);

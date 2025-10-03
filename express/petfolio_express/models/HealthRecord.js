const mongoose = require("mongoose");

const healthRecordSchema = new mongoose.Schema({
  pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  clinic: { type: String },
  detail: { type: String },
  cost: { type: Number, default: 0 },
});

module.exports = mongoose.model("HealthRecord", healthRecordSchema);
const mongoose = require("mongoose");
const { Schema, models } = mongoose;

const HealthSchema = new Schema({
  userId: { type: String, required: true },
  pet: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  clinic: String,
  detail: String,
  cost: { type: Number, default: 0 },
});

module.exports.HealthRecord =
  models.HealthRecord || mongoose.model("HealthRecord", HealthSchema);
import mongoose, { Schema, models } from "mongoose";

const HealthSchema = new Schema({
  pet: { type: String, required: true },
  type: { type: String, required: true },
  date: { type: String, required: true },
  clinic: String,
  detail: String,
  cost: { type: Number, default: 0 },
});

export default models.HealthRecord || mongoose.model("HealthRecord", HealthSchema);
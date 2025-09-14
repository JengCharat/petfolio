// models/Pet.js
const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true }, // dog, cat, bird ...
  breed: { type: String },
  birthdate: { type: String },           // เป็น String
  weight: { type: String },              // ต้องเป็น String
  gender: { type: String },
  personality: { type: String },
  medicalConditions: { type: String },
  privacy: { type: String, enum: ["private", "public"], default: "private" },
});


module.exports = mongoose.model("Pet", petSchema);

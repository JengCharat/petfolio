const express = require("express");
const router = express.Router();
const Pet = require("../models/pet");
const User = require("../models/User"); // เพิ่ม import

// GET /api/pets → ดึงสัตว์ทั้งหมด + populate owner
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find({}).populate("owner", "username email"); 
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/pets/user/:userId → ดึงสัตว์ของผู้ใช้คนเดียว
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // หา User ใน backend
    const user = await User.findOne({ userId }); // หรือ _id: userId ถ้า frontend ส่ง _id
    if (!user) return res.status(404).json({ error: "User not found" });

    // query pets ของ user
    const pets = await Pet.find({ owner: user._id }).populate("owner", "username email");

    res.json(pets); // ส่งกลับเป็น array
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// POST /api/pets → เพิ่มสัตว์ใหม่
router.post("/", async (req, res) => {
  const { name, type, breed, birthdate, weight, gender, personality, medicalConditions, privacy, ownerId } = req.body;

  try {
    // หา User ใน backend
    const user = await User.findOne({ userId: ownerId }); // หรือ _id: ownerId
    if (!user) return res.status(400).json({ error: "Owner not found" });

    const pet = new Pet({
      name,
      type,
      breed,
      birthdate,
      weight: String(weight || ""),
      gender,
      personality,
      medicalConditions,
      privacy,
      owner: user._id,
    });

    await pet.save();
    res.status(201).json({ message: "Pet created", pet });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// PUT /api/pets/:id → แก้ไขสัตว์
router.put("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPet = await Pet.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).populate("owner", "username email");

    if (!updatedPet) return res.status(404).json({ error: "Pet not found" });

    res.json(updatedPet);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/pets/:id → ลบสัตว์
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const pet = await Pet.findByIdAndDelete(id);
    if (!pet) return res.status(404).json({ message: "Pet not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete pet" });
  }
});

module.exports = router;

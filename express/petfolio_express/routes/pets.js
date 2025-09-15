const express = require("express");
const router = express.Router();
const Pet = require("../models/pet");

// GET /api/pets → ดึงสัตว์ทั้งหมด
router.get("/", async (req, res) => {
  try {
    const pets = await Pet.find({});
    res.json(pets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/pets → เพิ่มสัตว์ใหม่
router.post("/", async (req, res) => {
  try {
    const pet = new Pet(req.body);
    await pet.save();
    res.status(201).json(pet);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    );

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

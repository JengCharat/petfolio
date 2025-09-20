import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import mongoose from "mongoose";

const PetSchema = new mongoose.Schema({
  name: String,
  type: String,
  emoji: String,
});

const Pet = mongoose.models.Pet || mongoose.model("Pet", PetSchema);

// ✅ GET (ดึงรายการสัตว์เลี้ยง)
export async function GET() {
  await connectDB();
  const pets = await Pet.find();
  return NextResponse.json(pets);
}

// ✅ POST (เพิ่มสัตว์เลี้ยง)
export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const pet = await Pet.create(body);
    return NextResponse.json(pet, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to add pet" }, { status: 500 });
  }
}
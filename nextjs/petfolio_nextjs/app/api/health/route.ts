import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HealthRecord from "@/models/HealthRecord";

// ✅ GET (ดึงทั้งหมด)
export async function GET() {
  await connectDB();
  const records = await HealthRecord.find();
  return NextResponse.json(records);
}

// ✅ POST (เพิ่ม)
export async function POST(req: Request) {
  await connectDB();
  try {
    const body = await req.json();
    const newRecord = await HealthRecord.create(body);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to add record" }, { status: 500 });
  }
}
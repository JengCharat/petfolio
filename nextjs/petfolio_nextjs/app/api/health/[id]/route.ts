import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import HealthRecord from "@/models/HealthRecord";

// ✅ PUT (แก้ไข)
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    const body = await req.json();
    const updated = await HealthRecord.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update record" }, { status: 500 });
  }
}

// ✅ DELETE (ลบ)
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  try {
    await HealthRecord.findByIdAndDelete(params.id);
    return NextResponse.json({ message: `Deleted record ${params.id}` });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete record" }, { status: 500 });
  }
}
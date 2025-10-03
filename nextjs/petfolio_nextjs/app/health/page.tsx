"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Treatment =
  | "vaccine" | "deworming" | "grooming" | "nail_trim"
  | "dental" | "checkup" | "treatment" | "ticks_and_fleas" | "other";

type HealthRecord = {
  _id: string;
  pet: any; // populate จะส่ง object มา
  type: Treatment;
  date: string;
  clinic?: string;
  detail?: string;
  cost: number;
};

const BASE_URL = "http://localhost:3002/api";

const treatmentLabels: Record<Treatment, string> = {
  vaccine: "วัคซีน 💉",
  deworming: "ถ่ายพยาธิ 💊",
  grooming: "อาบน้ำ/ตัดขน ✂️",
  nail_trim: "ตัดเล็บ 💅",
  dental: "ทำฟัน 🦷",
  checkup: "ตรวจสุขภาพ 🏥",
  treatment: "รักษาโรค 🩺",
  ticks_and_fleas: "กำจัดเห็บหมัด 🕷️",
  other: "อื่นๆ 📝",
};

export default function HealthApp() {
  const [records, setRecords] = useState<HealthRecord[]>([]);

  // โหลด Health Records ทั้งหมด
  useEffect(() => {
    const ac = new AbortController();
    fetch(`${BASE_URL}/health`, { signal: ac.signal })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch health records");
        return res.json();
      })
      .then((data) => {
        console.log("✅ fetched records:", data);
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error("fetch health error:", err);
      });
    return () => ac.abort();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-3xl font-bold mb-6"> บันทึกสุขภาพสัตว์เลี้ยง</h2>

        {records.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีข้อมูลบันทึกสุขภาพ</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((rec) => (
              <div key={rec._id} className="p-4 bg-white rounded-lg shadow">
                <h3 className="text-lg font-semibold">
                  {/* ถ้า pet เป็น object ให้แสดงชื่อ */}
                  {typeof rec.pet === "object" ? rec.pet.name : rec.pet}
                </h3>
                <p>{treatmentLabels[rec.type]}</p>
                <p className="text-sm text-gray-500">{rec.date}</p>
                <p className="text-sm">คลินิก: {rec.clinic || "-"}</p>
                <p className="text-sm">รายละเอียด: {rec.detail || "-"}</p>
                <p className="text-sm font-semibold text-green-700">
                  ค่าใช้จ่าย: {rec.cost} บาท
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
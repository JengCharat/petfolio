"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Pet = {
  _id: string;
  name: string;
  type?: string;
};

type HealthRecord = {
  _id: string;
  pet: Pet;
  date: string;
  treatment: string;
  notes?: string;
};

const BASE_URL = "http://localhost:3002/api";

export default function HealthPage() {
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newRecord, setNewRecord] = useState<{ petId: string; treatment: string; notes?: string }>({
    petId: "",
    treatment: "",
    notes: "",
  });
  const [pets, setPets] = useState<Pet[]>([]);

  // ตัวอย่าง userId ของผู้ใช้คนนี้
  const userId = "v1hpdiuL_7PLN27o3yNx-";

  // โหลด pets ของ user
  const loadPets = async () => {
    try {
      const res = await fetch(`${BASE_URL}/pets/user/${userId}`);
      const data = await res.json();
      setPets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetch pets error:", err);
    }
  };

  // โหลด health records ของ user
  const loadRecords = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/health/user/${userId}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetch health records error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPets();
    loadRecords();
  }, []);

  // เพิ่ม record ใหม่
  const addRecord = async () => {
    if (!newRecord.petId || !newRecord.treatment) return;
    try {
      const res = await fetch(`${BASE_URL}/health`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet: newRecord.petId,
          treatment: newRecord.treatment,
          notes: newRecord.notes,
          date: new Date(),
        }),
      });
      const data = await res.json();
      setRecords([data, ...records]); // เพิ่ม record ใหม่ด้านบน
      setNewRecord({ petId: "", treatment: "", notes: "" });
    } catch (err) {
      console.error("add record error:", err);
    }
  };

  // ลบ record
  const deleteRecord = async (id: string) => {
    try {
      await fetch(`${BASE_URL}/health/${id}`, { method: "DELETE" });
      setRecords(records.filter((r) => r._id !== id));
    } catch (err) {
      console.error("delete record error:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">ประวัติสุขภาพสัตว์เลี้ยง</h2>

        {/* ฟอร์มเพิ่ม record */}
        <div className="mb-6 p-4 bg-white rounded shadow">
          <select
            value={newRecord.petId}
            onChange={(e) => setNewRecord({ ...newRecord, petId: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          >
            <option value="">เลือกสัตว์เลี้ยง</option>
            {pets.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.type})
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Treatment"
            value={newRecord.treatment}
            onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={newRecord.notes}
            onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          />
          <button onClick={addRecord} className="px-4 py-2 bg-green-600 text-white rounded">
            เพิ่ม
          </button>
        </div>

        {/* แสดงรายการ record */}
        {loading ? (
          <p>Loading...</p>
        ) : records.length === 0 ? (
          <p>ยังไม่มีประวัติสุขภาพ</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {records.map((r) => (
              <div key={r._id} className="p-4 bg-white rounded shadow">
                <h3 className="font-semibold">
                  {r.pet?.name} ({r.pet?.type})
                </h3>
                <p><strong>Treatment:</strong> {r.treatment}</p>
                <p><strong>Date:</strong> {new Date(r.date).toLocaleDateString()}</p>
                {r.notes && <p><strong>Notes:</strong> {r.notes}</p>}
                <button
                  onClick={() => deleteRecord(r._id)}
                  className="mt-2 px-3 py-1 bg-red-600 text-white rounded"
                >
                  ลบ
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

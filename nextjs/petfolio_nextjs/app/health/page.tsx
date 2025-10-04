"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Pet = {
  _id: string;
  name: string;
  type?: string;
  breed?: string;
};

type Treatment =
  | "vaccine"
  | "deworming"
  | "grooming"
  | "nail_trim"
  | "dental"
  | "checkup"
  | "treatment"
  | "ticks_and_fleas"
  | "other";

type HealthRecord = {
  _id: string;
  pet: Pet;
  type: Treatment;
  date: string;
  clinic?: string;
  detail?: string;
  cost: number;
};

const BASE_URL = "http://localhost:3002/api";

const typeEmoji: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  rabbit: "🐰",
  hamster: "🐹",
  bird: "🐦",
};

const treatmentLabels: Record<Treatment, string> = {
  vaccine: "วัคซีน",
  deworming: "ถ่ายพยาธิ",
  grooming: "ตัดขน",
  nail_trim: "ตัดเล็บ",
  dental: "ทำฟัน",
  checkup: "ตรวจสุขภาพ",
  treatment: "รักษาโรค",
  ticks_and_fleas: "ป้องกันเห็บหมัด",
  other: "อื่น ๆ",
};

export default function PetApp() {
  const [currentUser, setCurrentUser] = useState<{ _id: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showFormModal, setShowFormModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  // ✅ form เก็บ pet เป็น string (_id) ไม่ใช่ object
  const [form, setForm] = useState<{
    pet?: string;
    type?: Treatment;
    date?: string;
    clinic?: string;
    detail?: string;
    cost?: number;
  }>({});

  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  // โหลด token และ userId
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    setToken(storedToken);
    if (storedUserId) setCurrentUser({ _id: storedUserId });
  }, []);

  // โหลด pets
  const loadPets = () => {
    if (!token || !currentUser) return;
    fetch(`${BASE_URL}/pets/user/${currentUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch((err) => console.error("fetch pets error:", err));
  };

  // โหลด health records
  const loadHealthRecords = () => {
    if (!token || !currentUser) return;
    fetch(`${BASE_URL}/health/user/${currentUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch((err) => console.error("fetch health error:", err));
  };

  // ลบ record
  const deleteRecord = async (id: string) => {
    if (!token) return;
    if (!confirm("ต้องการลบข้อมูลนี้จริงหรือไม่?")) return;
    try {
      await fetch(`${BASE_URL}/health/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      loadHealthRecords();
    } catch (err) {
      console.error("delete error:", err);
    }
  };

  // เปิด modal แก้ไข
  const openEditModal = (rec: HealthRecord) => {
    setSelectedRecord(rec);
    setForm({
      pet: rec.pet._id, // ✅ ใช้ _id เป็น string
      type: rec.type,
      date: rec.date,
      clinic: rec.clinic,
      detail: rec.detail,
      cost: rec.cost,
    });
    setIsEdit(true);
    setShowFormModal(true);
  };

  // บันทึกเพิ่ม / แก้ไข record
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentUser || !form.pet || !form.type || !form.date) return;

    const payload = {
      pet: form.pet,
      type: form.type,
      date: form.date,
      clinic: form.clinic,
      detail: form.detail,
      cost: form.cost || 0,
      ownerUserId: currentUser._id,
    };

    try {
      if (isEdit && selectedRecord) {
        // PUT
        await fetch(`${BASE_URL}/health/${selectedRecord._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      } else {
        // POST
        await fetch(`${BASE_URL}/health`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify(payload),
        });
      }

      setShowFormModal(false);
      setForm({});
      setIsEdit(false);
      setSelectedRecord(null);
      loadHealthRecords();
    } catch (err) {
      console.error("save error:", err);
    }
  };

  useEffect(() => {
    if (token && currentUser) {
      loadPets();
      loadHealthRecords();
    }
  }, [token, currentUser]);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">สัตว์เลี้ยงของฉัน</h2>

{/* ประวัติสุขภาพ */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">ประวัติสุขภาพสัตว์เลี้ยง</h2>
          <button
            onClick={() => { setShowFormModal(true); setIsEdit(false); setForm({}); }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ➕ เพิ่มประวัติ
          </button>
        </div>

        {/* รายการสัตว์เลี้ยง */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {pets.map((p) => (
            <div
              key={p._id}
              onClick={() => setSelectedPet(p)}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer"
            >
              <h3 className="text-lg font-semibold">
                {p.name} {typeEmoji[p.type ?? ""] ?? ""}
              </h3>
              <p>{p.type} {p.breed ? `(${p.breed})` : ""}</p>
            </div>
          ))}
        </div>

        {selectedPet && (
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">
              ประวัติสุขภาพ: {selectedPet.name}
            </h2>
            <button onClick={() => setSelectedPet(null)} className="px-4 py-2 bg-gray-500 text-white rounded">
              แสดงทั้งหมด
            </button>
          </div>
        )}

        

        {records.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีข้อมูลสุขภาพ</p>
        ) : (
          <ul className="space-y-4">
            {records
              .filter((rec) => !selectedPet || rec.pet._id === selectedPet._id)
              .map((rec) => (
                <li key={rec._id} className="p-4 bg-white rounded-lg shadow hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">
                      {rec.pet?.name} {typeEmoji[rec.pet?.type ?? ""] ?? ""} - {treatmentLabels[rec.type]}
                    </h3>
                    <div className="space-x-2">
                      <button
                        onClick={() => { setSelectedRecord(rec); setShowRecordModal(true); }}
                        className="px-3 py-1 bg-gray-600 text-white rounded"
                      >
                        ดู
                      </button>
                      <button
                        onClick={() => openEditModal(rec)}
                        className="px-3 py-1 bg-yellow-500 text-white rounded"
                      >
                        ✏️ แก้ไข
                      </button>
                      <button
                        onClick={() => deleteRecord(rec._id)}
                        className="px-3 py-1 bg-red-600 text-white rounded"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                  <p><strong>วันที่:</strong> {rec.date}</p>
                  <p><strong>สถานที่:</strong> {rec.clinic || "-"}</p>
                  <p><strong>ค่าใช้จ่าย:</strong> {rec.cost} บาท</p>
                </li>
              ))}
          </ul>
        )}

        {/* Modal เพิ่ม / แก้ไข record */}
        {showFormModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">{isEdit ? "แก้ไขประวัติสุขภาพ" : "เพิ่มประวัติสุขภาพ"}</h3>
              <form onSubmit={handleFormSubmit} className="space-y-3">
                <select
                  name="pet"
                  value={form.pet || ""}
                  onChange={(e) => setForm({ ...form, pet: e.target.value })} // ✅ string id
                  className="w-full border px-3 py-2"
                  required
                >
                  <option value="">เลือกสัตว์เลี้ยง</option>
                  {pets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {typeEmoji[p.type ?? ""]}
                    </option>
                  ))}
                </select>

                <select
                  name="type"
                  value={form.type || ""}
                  onChange={(e) => setForm({ ...form, type: e.target.value as Treatment })}
                  className="w-full border px-3 py-2"
                  required
                >
                  <option value="">เลือกประเภท</option>
                  {Object.entries(treatmentLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <input
                  type="date"
                  name="date"
                  value={form.date || ""}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full border px-3 py-2"
                  required
                />
                <input
                  type="text"
                  name="clinic"
                  placeholder="คลินิก"
                  value={form.clinic || ""}
                  onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                  className="w-full border px-3 py-2"
                />
                <textarea
                  name="detail"
                  placeholder="รายละเอียด"
                  value={form.detail || ""}
                  onChange={(e) => setForm({ ...form, detail: e.target.value })}
                  className="w-full border px-3 py-2"
                />
                <input
                  type="number"
                  name="cost"
                  placeholder="ค่าใช้จ่าย"
                  value={form.cost || ""}
                  onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                  className="w-full border px-3 py-2"
                />

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => { setShowFormModal(false); setIsEdit(false); setForm({}); }}
                    className="px-4 py-2 bg-gray-400 text-white rounded"
                  >
                    ยกเลิก
                  </button>
                  <button type="submit" className={`px-4 py-2 ${isEdit ? "bg-yellow-500" : "bg-blue-600"} text-white rounded`}>
                    {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Treatment =
  | "vaccine" | "deworming" | "grooming" | "nail_trim"
  | "dental" | "checkup" | "treatment" | "ticks_and_fleas" | "other";

type Pet = {
  _id: string;
  name: string;
  type?: string;
  emoji?: string;
};

type HealthRecord = {
  _id: string;
  pet: Pet | string;
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
  const [pets, setPets] = useState<Pet[]>([]);

  // modal states
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<HealthRecord | null>(null);

  const [form, setForm] = useState({
    pet: "",
    type: "",
    date: "",
    clinic: "",
    detail: "",
    cost: 0,
  });

  // โหลด Health Records
  const loadRecords = () => {
    fetch(`${BASE_URL}/health`)
      .then((res) => res.json())
      .then((data) => setRecords(Array.isArray(data) ? data : []))
      .catch((err) => console.error("fetch health error:", err));
  };

  // โหลด Pets
  const loadPets = () => {
    fetch(`${BASE_URL}/pets`)
      .then((res) => res.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch((err) => console.error("fetch pets error:", err));
  };

  useEffect(() => {
    loadRecords();
    loadPets();
  }, []);

  // ฟังก์ชัน Form
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${BASE_URL}/health`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      loadRecords();
      setShowModal(false);
      resetForm();
    }
  };

  const editRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const res = await fetch(`${BASE_URL}/health/${editingRecord._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      loadRecords();
      setShowEditModal(false);
      setEditingRecord(null);
      resetForm();
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบ?")) return;
    const res = await fetch(`${BASE_URL}/health/${id}`, { method: "DELETE" });
    if (res.ok) loadRecords();
  };

  const openEditModal = (rec: HealthRecord) => {
    setEditingRecord(rec);
    setForm({
      pet: typeof rec.pet === "object" ? rec.pet._id : rec.pet,
      type: rec.type,
      date: rec.date.split("T")[0],
      clinic: rec.clinic ?? "",
      detail: rec.detail ?? "",
      cost: rec.cost ?? 0,
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setForm({ pet: "", type: "", date: "", clinic: "", detail: "", cost: 0 });
  };

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">บันทึกสุขภาพสัตว์เลี้ยงของฉัน</h2>
          <button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg"
          >
            ➕ เพิ่มบันทึก
          </button>
        </div>

        {/* Records Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => (
            <div key={rec._id} className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold">
                {typeof rec.pet === "object" ? rec.pet.name : rec.pet}
              </h3>
              <p>{treatmentLabels[rec.type]}</p>
              <p className="text-sm text-gray-500">{rec.date}</p>
              <div className="flex gap-2 mt-3">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                  onClick={() => {
                    setSelectedRecord(rec);
                    setShowDetailModal(true);
                  }}
                >
                  ดูรายละเอียด
                </button>
                <button
                  className="bg-yellow-500 text-white px-3 py-1 rounded"
                  onClick={() => openEditModal(rec)}
                >
                  แก้ไข
                </button>
                <button
                  className="bg-red-600 text-white px-3 py-1 rounded"
                  onClick={() => deleteRecord(rec._id)}
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Modal เพิ่ม / แก้ไข */}
        {(showModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {showEditModal ? "แก้ไขบันทึกสุขภาพ" : "เพิ่มบันทึกสุขภาพ"}
              </h2>
              <form onSubmit={showEditModal ? editRecord : addRecord} className="space-y-6">
                <select
                  name="pet"
                  value={form.pet}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  required
                >
                  <option value="">เลือกสัตว์เลี้ยงของคุณ</option>
                  {pets.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} {p.emoji ?? ""} {p.type ? `(${p.type})` : ""}
                    </option>
                  ))}
                </select>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                >
                  <option value="">เลือกประเภท</option>
                  {Object.entries(treatmentLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
                <input
                  name="clinic"
                  value={form.clinic}
                  onChange={handleChange}
                  placeholder="ชื่อคลินิก"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
                <textarea
                  name="detail"
                  value={form.detail}
                  onChange={handleChange}
                  placeholder="รายละเอียด"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                />
                <input
                  type="number"
                  name="cost"
                  value={form.cost}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl"
                  placeholder="ค่าใช้จ่าย"
                  min={0}
                />

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setShowEditModal(false);
                      setEditingRecord(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border rounded"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white rounded"
                  >
                    บันทึก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal รายละเอียด */}
        {showDetailModal && selectedRecord && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">รายละเอียดบันทึก</h3>
              <p><strong>สัตว์เลี้ยง:</strong>{" "}
                {typeof selectedRecord.pet === "object"
                  ? selectedRecord.pet.name
                  : selectedRecord.pet}
              </p>
              <p><strong>ประเภท:</strong> {treatmentLabels[selectedRecord.type]}</p>
              <p><strong>วันที่:</strong> {selectedRecord.date}</p>
              <p><strong>สถานที่:</strong> {selectedRecord.clinic || "-"}</p>
              <p><strong>รายละเอียด:</strong> {selectedRecord.detail || "-"}</p>
              <p><strong>ค่าใช้จ่าย:</strong> {selectedRecord.cost} บาท</p>
              <div className="mt-4 text-right">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-green-600 text-white rounded"
                >
                  ปิด
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Pet = {
  _id: string;
  name: string;
  type?: string;
  breed?: string;
};

type HealthRecord = {
  _id: string;
  pet: Pet;
  type: string;
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

export default function PetApp() {
  const [currentUser, setCurrentUser] = useState<{ _id: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [pets, setPets] = useState<Pet[]>([]);
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [showRecordModal, setShowRecordModal] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<HealthRecord>>({});

  // โหลด token และ userId จาก localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    setToken(storedToken);
    if (storedUserId) {
      setCurrentUser({ _id: storedUserId });
    }
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

  // บันทึก record ใหม่
  const saveNewRecord = async () => {
    if (!token || !currentUser) return;
    if (!newRecord.pet) {
      alert("กรุณาเลือกสัตว์เลี้ยง");
      return;
    }
    try {
      const payload = {
        pet: (newRecord.pet as Pet)._id,
        type: newRecord.type,
        date: newRecord.date,
        clinic: newRecord.clinic,
        detail: newRecord.detail,
        cost: newRecord.cost || 0,
        ownerUserId: currentUser._id,
      };

      await fetch(`${BASE_URL}/health`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      setShowAddModal(false);
      setNewRecord({});
      loadHealthRecords();
    } catch (err) {
      console.error("create error:", err);
    }
  };

  // โหลดข้อมูลเมื่อ user พร้อม
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
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
          สัตว์เลี้ยงของฉัน
        </h2>

        {/* เลือกสัตว์เลี้ยง */}
        <select
          onChange={(e) => {
            const pet = pets.find((p) => p._id === e.target.value) || null;
            setSelectedPet(pet);
            setShowDetailModal(!!pet);
          }}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl mb-6"
        >
          <option value="">เลือกสัตว์เลี้ยงของคุณ</option>
          {pets.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name} {typeEmoji[p.type ?? ""] ?? ""} ({p.type}, {p.breed})
            </option>
          ))}
        </select>

        {/* Modal รายละเอียดสัตว์เลี้ยง */}
        {showDetailModal && selectedPet && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-xl max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">
                {selectedPet.name} {typeEmoji[selectedPet.type ?? ""] ?? ""}
              </h3>
              <p>
                <strong>ประเภท:</strong> {selectedPet.type || "-"}
              </p>
              <p>
                <strong>สายพันธุ์:</strong> {selectedPet.breed || "-"}
              </p>
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

        {/* รายการสัตว์เลี้ยง */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {pets.map((p) => (
            <div
              key={p._id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md"
            >
              <h3 className="text-lg font-semibold">
                {p.name} {typeEmoji[p.type ?? ""] ?? ""}
              </h3>
              <p>
                {p.type} {p.breed ? `(${p.breed})` : ""}
              </p>
            </div>
          ))}
        </div>

        {/* ประวัติสุขภาพ */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800">
            ประวัติสุขภาพสัตว์เลี้ยง
          </h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            ➕ เพิ่มประวัติ
          </button>
        </div>

        {records.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีข้อมูลสุขภาพ</p>
        ) : (
          <ul className="space-y-4">
            {records.map((rec) => (
              <li
                key={rec._id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">
                    {rec.pet?.name} {typeEmoji[rec.pet?.type ?? ""] ?? ""} -{" "}
                    {rec.type}
                  </h3>
                  <div className="space-x-2">
                    <button
                      onClick={() => {
                        setSelectedRecord(rec);
                        setShowRecordModal(true);
                      }}
                      className="px-3 py-1 bg-gray-600 text-white rounded"
                    >
                      ดู
                    </button>
                    <button
                      onClick={() => deleteRecord(rec._id)}
                      className="px-3 py-1 bg-red-600 text-white rounded"
                    >
                      ลบ
                    </button>
                  </div>
                </div>
                <p>
                  <strong>วันที่:</strong> {rec.date}
                </p>
                <p>
                  <strong>สถานที่:</strong> {rec.clinic || "-"}
                </p>
                <p>
                  <strong>ค่าใช้จ่าย:</strong> {rec.cost} บาท
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal ดูรายละเอียด record */}
      {showRecordModal && selectedRecord && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {selectedRecord.pet?.name} {typeEmoji[selectedRecord.pet?.type ?? ""] ?? ""} - {selectedRecord.type}
            </h3>
            <p><strong>วันที่:</strong> {selectedRecord.date}</p>
            <p><strong>สถานที่:</strong> {selectedRecord.clinic || "-"}</p>
            <p><strong>รายละเอียด:</strong> {selectedRecord.detail || "-"}</p>
            <p><strong>ค่าใช้จ่าย:</strong> {selectedRecord.cost} บาท</p>
            <div className="mt-4 text-right">
              <button
                onClick={() => setShowRecordModal(false)}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ฟอร์มเพิ่ม record */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">เพิ่มประวัติสุขภาพ</h3>

            <select
              className="w-full border px-3 py-2 mb-3"
              onChange={(e) =>
                setNewRecord({
                  ...newRecord,
                  pet: pets.find((p) => p._id === e.target.value)!,
                })
              }
            >
              <option value="">เลือกสัตว์เลี้ยง</option>
              {pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} {typeEmoji[p.type ?? ""]}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="ประเภท (vaccine, checkup ...)"
              className="w-full border px-3 py-2 mb-3"
              onChange={(e) => setNewRecord({ ...newRecord, type: e.target.value })}
            />
            <input
              type="date"
              className="w-full border px-3 py-2 mb-3"
              onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })}
            />
            <input
              type="text"
              placeholder="คลินิก"
              className="w-full border px-3 py-2 mb-3"
              onChange={(e) => setNewRecord({ ...newRecord, clinic: e.target.value })}
            />
            <textarea
              placeholder="รายละเอียด"
              className="w-full border px-3 py-2 mb-3"
              onChange={(e) => setNewRecord({ ...newRecord, detail: e.target.value })}
            />
            <input
              type="number"
              placeholder="ค่าใช้จ่าย"
              className="w-full border px-3 py-2 mb-3"
              onChange={(e) =>
                setNewRecord({ ...newRecord, cost: Number(e.target.value) })
              }
            />

            <div className="flex justify-between">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded"
              >
                ยกเลิก
              </button>
              <button
                onClick={saveNewRecord}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

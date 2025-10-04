"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Pet = {
    _id: string;
    name: string;
    type?: string;
    breed?: string;
    medicalConditions?: string;
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

    const [showFormModal, setShowFormModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
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
            setShowRecordModal(false);
        } catch (err) {
            console.error("delete error:", err);
        }
    };

    // เปิด modal แก้ไข
    const openEditModal = (rec: HealthRecord) => {
        setSelectedRecord(rec);
        setForm({
            pet: rec.pet._id,
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

    // แปลง YYYY-MM-DD -> DD / MM / YYYY
    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split("-");
        return `${day} / ${month} / ${year}`;
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

                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">ประวัติสุขภาพสัตว์เลี้ยง</h2>
                    <button
                        onClick={() => { setShowFormModal(true); setIsEdit(false); setForm({}); }}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
                    >
                        ➕ เพิ่มประวัติ
                    </button>
                </div>

                {/* รายการสัตว์เลี้ยง */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4 ">
                    {pets.map((p) => (
                        <div
                            key={p._id}
                            onClick={() => setSelectedPet(p)}
                            className="p-4 bg-purple-200 rounded-lg shadow hover:shadow-md cursor-pointer border border-gray-300"
                        >
                            <h3 className="text-lg font-semibold">
                                {p.name} {typeEmoji[p.type ?? ""] ?? ""}
                            </h3>
                            <p className="mb-2">{p.type} {p.breed ? `(สายพันธ์ุ: ${p.breed})` : ""}</p>
                            {p.medicalConditions && (
                                <p className="text-red-500">⚠️ ข้อมูลสำคัญทางการแพทย์: {p.medicalConditions}</p>
                            )}
                        </div>
                    ))}
                </div>

                <hr className="my-4 border-t border-gray-400 mx-auto w-11/12" />

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
                                <li key={rec._id} className="p-4 bg-gray-200 rounded-lg shadow hover:shadow-md">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold">
                                            {rec.pet?.name} {typeEmoji[rec.pet?.type ?? ""] ?? ""} - {treatmentLabels[rec.type]}
                                        </h3>
                                        <div className="space-x-2">
                                            <button
                                                onClick={() => { setSelectedRecord(rec); setShowRecordModal(true); }}
                                                className="px-3 py-1 bg-purple-600 text-white rounded "
                                            >
                                                ดูรายละเอียด
                                            </button>

                                        </div>
                                    </div>
                                    <p><strong>วันที่ : </strong> {formatDate(rec.date)}</p>
                                    <p><strong>ลายละเอียด : </strong> {rec.detail || "-"}</p>
                                </li>
                            ))}
                    </ul>
                )}

                {/* Modal ดู record */}
{showRecordModal && selectedRecord && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
    <div className="bg-white p-6 rounded-xl max-w-md w-full relative">
      {/* ปุ่ม X มุมบนขวา */}
      <button
        onClick={() => setShowRecordModal(false)}
        className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 font-bold text-xl"
      >
        ✕
      </button>

      <h3 className="text-xl font-bold mb-4">
        {selectedRecord.pet?.name} {typeEmoji[selectedRecord.pet?.type ?? ""] ?? ""} - {treatmentLabels[selectedRecord.type]}
      </h3>
      <p><strong>วันที่ : </strong> {formatDate(selectedRecord.date)}</p>
      <p><strong>สถานที่ : </strong> {selectedRecord.clinic || "-"}</p>
      <p><strong>รายละเอียด : </strong> {selectedRecord.detail || "-"}</p>
      <p><strong>ค่าใช้จ่าย : </strong> {selectedRecord.cost} บาท</p>

      {/* ปุ่มแก้ไข/ลบ อยู่ชิดล่างขวา */}
      <div className="flex justify-end space-x-2 mt-6">
        <button
          onClick={() => openEditModal(selectedRecord)}
          className="px-4 py-2 bg-yellow-500 text-white rounded"
        >
          ✏️ แก้ไข
        </button>
        <button
          onClick={() => deleteRecord(selectedRecord._id)}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          ลบ
        </button>
      </div>
    </div>
  </div>
)}



                {/* Modal เพิ่ม / แก้ไข record */}
                {showFormModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <h3 className="text-xl font-bold mb-4">{isEdit ? "แก้ไขประวัติสุขภาพ" : "เพิ่มประวัติสุขภาพ"}</h3>
                            <form onSubmit={handleFormSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">เลือกสัตว์เลี้ยง</label>
                                    <select
                                        name="pet"
                                        value={form.pet || ""}
                                        onChange={(e) => setForm({ ...form, pet: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">เลือกสัตว์เลี้ยง</option>
                                        {pets.map((p) => (
                                            <option key={p._id} value={p._id}>
                                                {p.name} {typeEmoji[p.type ?? ""]}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">ประเภทการดูแล</label>
                                    <select
                                        name="type"
                                        value={form.type || ""}
                                        onChange={(e) => setForm({ ...form, type: e.target.value as Treatment })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    >
                                        <option value="">เลือกประเภท</option>
                                        {Object.entries(treatmentLabels).map(([k, v]) => (
                                            <option key={k} value={k}>{v}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">วันที่</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={form.date || ""}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">คลินิก</label>
                                    <input
                                        type="text"
                                        name="clinic"
                                        placeholder="คลินิก"
                                        value={form.clinic || ""}
                                        onChange={(e) => setForm({ ...form, clinic: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">รายละเอียดบันทึก</label>
                                    <textarea
                                        name="detail"
                                        placeholder="รายละเอียด"
                                        value={form.detail || ""}
                                        onChange={(e) => setForm({ ...form, detail: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">ค่าใช้จ่าย</label>
                                    <input
                                        type="number"
                                        name="cost"
                                        placeholder="ค่าใช้จ่าย"
                                        value={form.cost || ""}
                                        onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>

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

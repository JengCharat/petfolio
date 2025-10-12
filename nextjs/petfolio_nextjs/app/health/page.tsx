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

const BASE_URL = "https://petfolio.lol/api/api";

const typeEmoji: Record<string, string> = {
     dog: "🐕",
    cat: "🐱",
    bird: "🐦",
    fish: "🐠",
    rabbit: "🐰",
    hamster: "🐹",
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
                await fetch(`${BASE_URL}/health/${selectedRecord._id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                    body: JSON.stringify(payload),
                });
            } else {
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
        <div className="font-sans bg-[#f9f9f9] min-h-screen">
  <Navbar />
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

    {/* Header + Add Button */}
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-3xl font-bold text-gray-800">ประวัติสุขภาพสัตว์เลี้ยง</h2>
      <button
        onClick={() => { setShowFormModal(true); setIsEdit(false); setForm({}); }}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-shadow shadow-md"
      >
        ✚ เพิ่มประวัติ
      </button>
    </div>

    
    {/* รายการสัตว์เลี้ยง แนวนอน */}
<div className="flex space-x-4 overflow-x-auto pb-4">
  {pets.map((p) => (
    <div
      key={p._id}
      onClick={() => setSelectedPet(p)}
      className={`min-w-[250px] flex-shrink-0 bg-white rounded-2xl p-6 shadow-md flex flex-col items-center transition-all duration-200
        ${selectedPet?._id === p._id ? "border-2 border-purple-500 shadow-lg" : "border border-gray-200 hover:shadow-lg"}`}
    >
      <div className="text-5xl mb-2">{typeEmoji[p.type ?? ""] ?? ""}</div>
      <h3 className="text-black text-xl font-bold">ชื่อสัตว์เลี้ยง: {p.name}</h3>
      <p className="mb-1 text-black">สายพันธุ์: {p.breed ? ` ${p.breed}` : ""}</p>
      <p className="text-red-500 font-semibold mb-1">⚠️ โรคประจำตัว/อาการแพ้</p>
      <p className="text-red-500">{p.medicalConditions || "ไม่มี"}</p>
    </div>
  ))}
</div>


    


    <hr className="my-4 border-t border-gray-300 mx-auto w-full" />

    {/* แสดงบันทึกสุขภาพเมื่อเลือกสัตว์ */}
{selectedPet ? (
  <div>
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-2xl font-bold text-gray-800">ประวัติสุขภาพ - {selectedPet.name}</h3>
    </div>

    {records.filter((rec) => rec.pet._id === selectedPet._id).length === 0 ? (
      <p className="text-gray-500">ยังไม่มีข้อมูลสุขภาพสำหรับ {selectedPet.name}</p>
    ) : (
      <ul className="space-y-4">
        {records
          .filter((rec) => rec.pet._id === selectedPet._id)
          .map((rec) => (
            <li
              key={rec._id}
              className="p-4 bg-gray-50 rounded-lg shadow hover:shadow-lg transition flex flex-col"
            >
              <div className="mb-2">
                <h4 className=" text-black text-lg font-semibold">รายการ: {treatmentLabels[rec.type]}</h4>
              </div>

              <p className="text-gray-700"><strong>วันที่:</strong> {formatDate(rec.date)}</p>
              <p className="text-gray-700"><strong>รายละเอียด:</strong> {rec.detail || "-"}</p>

              {/* ปุ่มอยู่ขวาล่าง */}
              <div className="mt-auto flex justify-end">
                <button
                  onClick={() => { setSelectedRecord(rec); setShowRecordModal(true); }}
                  className="px-3 py-1 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
                >
                  ดูรายละเอียด
                </button>
              </div>
            </li>
          ))}
      </ul>
    )}
  </div>


    ) : (
      <p className="text-gray-500 text-center">เลือกสัตว์เลี้ยงเพื่อดูประวัติสุขภาพ</p>
    )}

    {/* Modal ดู record */}
    {showRecordModal && selectedRecord && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white p-6 rounded-2xl max-w-md w-full shadow-lg relative">
          
          {/* ข้อมูลบันทึกสุขภาพ */}
<div className="mb-6 text-center">
    <div className="mb-6 text-center">
  <h3 className="text-4xl font-bold text-gray-800 text-center">
    {selectedRecord.pet?.name}  
  </h3>
  </div>
   <div className="space-y-3 text-gray-700">

    <div className="flex justify-between">
    <strong className="font-medium">ประเภทการดูแล :</strong>
    <span className="text-end">{treatmentLabels[selectedRecord.type]}</span>
  </div>

  <div className="flex justify-between">
    <strong className="font-medium">วันที่ :</strong>
    <span className="text-end">{formatDate(selectedRecord.date)}</span>
  </div>

  <div className="flex justify-between">
    <strong className="font-medium">สถานที่ :</strong>
    <span className="text-end">{selectedRecord.clinic || "-"}</span>
  </div>

  <div className="flex justify-between">
    <strong className="font-medium">รายละเอียด :</strong>
    <span className="text-end">{selectedRecord.detail || "-"}</span>
  </div>

  <div className="flex justify-between">
    <strong className="font-medium">ค่าใช้จ่าย :</strong>
    <span className="text-end">{selectedRecord.cost ?? "-"} บาท</span>
  </div>

   
  </div>
</div>
<div className="flex justify-between items-center mt-6">
  {/* ปุ่มยกเลิก ซ้าย */}
  <button
    type="button"
    onClick={() => setShowRecordModal(false)}
    className="px-4 py-2 hover:bg-gray-50   border border-gray-300 text-gray-700 rounded-xl  transition"
  >
    ยกเลิก
  </button>

  {/* ปุ่มแก้ไข / ลบ ขวา */}
  <div className="flex space-x-2">
    <button
      onClick={() => openEditModal(selectedRecord)}
      className="px-4 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 transition"
    >
      แก้ไข
    </button>

    <button
      onClick={() => deleteRecord(selectedRecord._id)}
      className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
    >
      ลบ
    </button>
  </div>
</div>


        </div>
      </div>
    )}

    {/* Modal เพิ่ม / แก้ไข record */}
    {showFormModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-lg">
          <h3 className="text-black text-xl font-bold mb-4">{isEdit ? "แก้ไขประวัติสุขภาพ" : "เพิ่มประวัติสุขภาพ"}</h3>
          <form onSubmit={handleFormSubmit} className="space-y-3">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">เลือกสัตว์เลี้ยง</label>
                                    <select
                                        name="pet"
                                        value={form.pet || ""}
                                        onChange={(e) => setForm({ ...form, pet: e.target.value })}
                                        className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">รายละเอียดบันทึก</label>
                                    <textarea
                                        name="detail"
                                        placeholder="รายละเอียด"
                                        value={form.detail || ""}
                                        onChange={(e) => setForm({ ...form, detail: e.target.value })}
                                        className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                                        className="text-black w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex space-x-4 pt-4">
                                <button
                                  type="button"
                                  onClick={() => { setShowFormModal(false); setIsEdit(false); setForm({}); }}
                                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                  ยกเลิก
                                </button>

                                <button
                                  type="submit"
                                  className={`flex-1 px-6 py-3 ${isEdit ? "bg-yellow-500" : "bg-purple-600 hover:bg-purple-700"} text-white rounded-xl`}
                                >
                                  {isEdit ? "บันทึกการแก้ไข" : "บันทึก"}
                                </button>
                              </div>

                            </form>
        </div>
      </div>
    )}

  </div>
</div>

    );
}

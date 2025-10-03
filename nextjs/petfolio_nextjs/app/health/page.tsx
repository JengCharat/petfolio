"use client";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

type Pet = {
  _id: string;
  name: string;
  type?: string;
  breed?: string;
};

const BASE_URL = "http://localhost:3002/api";

// กำหนด emoji ตาม type
const typeEmoji: Record<string, string> = {
  cat: "🐱",
  dog: "🐶",
  rabbit: "🐰",
  hamster: "🐹",
  bird: "🐦",
};

export default function PetApp() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // โหลด Pets
  const loadPets = () => {
    fetch(`${BASE_URL}/pets/user/v1hpdiuL_7PLN27o3yNx-`)
      .then((res) => res.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch((err) => console.error("fetch pets error:", err));
  };

  useEffect(() => {
    loadPets();
  }, []);

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">สัตว์เลี้ยงของฉัน</h2>

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
              <h3 className="text-xl font-bold mb-4">{selectedPet.name} {typeEmoji[selectedPet.type ?? ""] ?? ""}</h3>
              <p><strong>ประเภท:</strong> {selectedPet.type || "-"}</p>
              <p><strong>สายพันธุ์:</strong> {selectedPet.breed || "-"}</p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((p) => (
            <div key={p._id} className="p-4 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold">{p.name} {typeEmoji[p.type ?? ""] ?? ""}</h3>
              <p>{p.type} {p.breed ? `(${p.breed})` : ""}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

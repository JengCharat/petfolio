"use client"; // ถ้าใช้ Next.js ต้องใส่
import { useEffect } from "react";

import React, { useState } from "react";

type PetType = "dog" | "cat" | "bird" | "fish" | "rabbit" | "hamster";

type Pet = {
    id: number;
    name: string;
    type: PetType;
    breed: string;
    birthdate: string;
    weight: number | null;
    gender: string;
    personality: string;
    medicalConditions: string;
    privacy: string;
    emoji: string;
};

const typeEmojis: Record<PetType, string> = {
    dog: "🐕",
    cat: "🐱",
    bird: "🐦",
    fish: "🐠",
    rabbit: "🐰",
    hamster: "🐹",
};

export default function PetApp() {
    const [pets, setPets] = useState<Pet[]>([]);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        name: "",
        type: "" as string,
        breed: "",
        birthdate: "",
        weight: "",
        gender: "",
        personality: "",
        medicalConditions: "",
        privacy: "private",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const addPet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const petType = form.type as PetType;

    const newPet: Omit<Pet, "id" | "emoji"> = {
    name: form.name,
    type: form.type as PetType,
    breed: form.breed,
    birthdate: form.birthdate, 
    weight: form.weight,  // ส่งเป็น string ตาม schema
    gender: form.gender,
    personality: form.personality,
    medicalConditions: form.medicalConditions,
    privacy: form.privacy,
};


    try {
    // แปลง weight เป็น string ก่อนส่ง
    const payload = {
        ...newPet,
        weight: newPet.weight !== null ? String(newPet.weight) : "", 
    };

    const res = await fetch("http://localhost:3002/pets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Failed to add pet");

    const savedPet = await res.json();

    // เพิ่ม frontend id และ emoji
    setPets([
        ...pets,
        {
            ...savedPet,
            id: pets.length + 1,
            emoji: typeEmojis[savedPet.type as PetType] || "🐾",
        },
    ]);

    setShowModal(false);
    setForm({
        name: "",
        type: "",
        breed: "",
        birthdate: "",
        weight: "",
        gender: "",
        personality: "",
        medicalConditions: "",
        privacy: "private",
    });
} catch (err) {
    console.error("Error adding pet:", err);
    alert("ไม่สามารถเพิ่มสัตว์เลี้ยงได้ โปรดลองอีกครั้ง");
}

};


useEffect(() => {
   fetch("http://localhost:3002/pets")
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    const petsWithEmoji = data.map((pet: any, index: number) => ({
      ...pet,
      id: index + 1,
      emoji: typeEmojis[pet.type as PetType] || "🐾",
    }));
    setPets(petsWithEmoji);
    
  })
  .catch(err => console.error("Error fetching pets:", err));

}, []);



    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">สัตว์เลี้ยงของฉัน</h2>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
                >
                    ➕ เพิ่มสัตว์เลี้ยงใหม่
                </button>
            </div>

            {/* Pets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pets.map((pet) => (
                    <div key={pet.id} className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center">
                        <div className="text-5xl mb-2">{pet.emoji}</div>
                        <h3 className="text-xl font-bold">{pet.name}</h3>
                        <p className="text-gray-500">{pet.breed}</p>
                        <p className="text-gray-400 text-sm mt-1">น้ำหนัก: {pet.weight ?? "-"} กก.</p>
                        <p className="text-gray-400 text-sm">เพศ: {pet.gender || "-"}</p>
                        <p className="text-gray-400 text-sm">สถานะ: {pet.privacy === "private" ? "🔒 ส่วนตัว" : "🌍 สาธารณะ"}</p>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มสัตว์เลี้ยงใหม่</h3>
                        <form className="space-y-6" onSubmit={addPet}>
                            {/* Name */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">ชื่อ *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            {/* Type */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">ประเภท *</label>
                                <select
                                    name="type"
                                    value={form.type}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    required
                                >
                                    <option value="">เลือกประเภทสัตว์</option>
                                    <option value="dog">สุนัข 🐕</option>
                                    <option value="cat">แมว 🐱</option>
                                    <option value="bird">นก 🐦</option>
                                    <option value="fish">ปลา 🐠</option>
                                    <option value="rabbit">กระต่าย 🐰</option>
                                    <option value="hamster">แฮมสเตอร์ 🐹</option>
                                </select>
                            </div>

                            {/* Breed */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">สายพันธุ์</label>
                                <input
                                    type="text"
                                    name="breed"
                                    value={form.breed}
                                    onChange={handleChange}
                                    placeholder="เช่น ชิวาวา, เปอร์เซีย"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Birthdate */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">วันเกิด</label>
                                <input
                                    type="text"
                                    name="birthdate"
                                    value={form.birthdate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Weight */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">น้ำหนัก (กก.)</label>
                                <input
                                    type="text"
                                    name="weight"
                                    value={form.weight}
                                    onChange={handleChange}
                                    step="0.1"
                                    min="0"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">เพศ</label>
                                <select
                                    name="gender"
                                    value={form.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    <option value="">เลือกเพศ</option>
                                    <option value="male">ผู้</option>
                                    <option value="female">เมีย</option>
                                </select>
                            </div>

                            {/* Personality */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">นิสัย/บุคลิกภาพ</label>
                                <textarea
                                    name="personality"
                                    value={form.personality}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="อธิบายนิสัยและบุคลิกภาพของสัตว์เลี้ยง..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                ></textarea>
                            </div>

                            {/* Medical Conditions */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">โรคประจำตัว/อาการแพ้</label>
                                <textarea
                                    name="medicalConditions"
                                    value={form.medicalConditions}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="ระบุโรคประจำตัว อาการแพ้ หรือข้อควรระวังทางการแพทย์..."
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                ></textarea>
                            </div>

                            {/* Privacy */}
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">สถานะโปรไฟล์</label>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="privacy"
                                            value="private"
                                            checked={form.privacy === "private"}
                                            onChange={handleChange}
                                            className="text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="ml-3">🔒 ส่วนตัว - เฉพาะคุณเท่านั้นที่เห็นข้อมูล</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="radio"
                                            name="privacy"
                                            value="public"
                                            checked={form.privacy === "public"}
                                            onChange={handleChange}
                                            className="text-purple-600 focus:ring-purple-500"
                                        />
                                        <span className="ml-3">🌍 สาธารณะ - แสดงในคอมมูนิตี้ได้</span>
                                    </label>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex space-x-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-colors"
                                >
                                    เพิ่มสัตว์เลี้ยง
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}


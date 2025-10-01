"use client"; // ถ้าใช้ Next.js ต้องใส่
import { useEffect } from "react";
import Navbar from "../components/Navbar"
import React, { useState } from "react";

type PetType = "dog" | "cat" | "bird" | "fish" | "rabbit" | "hamster";

type Pet = {
    _id: string;
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
    const [showEditModal, setShowEditModal] = useState(false);

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
        const userId = localStorage.getItem("userId");
        if (!userId) {
            alert("User not found. กรุณา login ก่อน");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            alert("Token not found. กรุณา login ใหม่");
            return;
        }

        const newPet = {
            ...form,
            type: form.type as PetType,
            weight: form.weight || "",
            ownerId: userId, // ส่งไป backend
        };

        try {
            const res = await fetch("http://localhost:3002/api/pets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(newPet),
            });

            if (!res.ok) throw new Error("Failed to add pet");
            const savedPet = await res.json();

            // เพิ่มเฉพาะถ้า ownerId ตรงกับผู้ใช้
            if (String(savedPet.pet.owner?._id) === String(userId)) {
                setPets(prev => [
                    ...prev,
                    { ...savedPet.pet, emoji: typeEmojis[savedPet.pet.type as PetType] || "🐾" },
                ]);
            }
            // กรณี backend ส่งเป็น { pet: {...} }
            const petData = savedPet.pet ?? savedPet;
            const petWithEmoji: Pet = {
                ...petData,
                emoji: typeEmojis[petData.type as PetType] || "🐾",
            };
            setPets(prev => [...prev, petWithEmoji]);
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
            console.error(err);
            alert("ไม่สามารถเพิ่มสัตว์เลี้ยงได้ โปรดลองอีกครั้ง");
        }
    };



    const [userId, setUserId] = useState<string | null>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // โหลดค่าจาก localStorage หลัง mount
        setUserId(localStorage.getItem("userId"));
        setToken(localStorage.getItem("token"));
    }, []);

    useEffect(() => {
        if (!userId || !token) return;

        fetch(`http://localhost:3002/api/pets/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => res.json())
            .then(data => {
                console.log("Pets from backend:", data);
                if (!Array.isArray(data)) {
                    console.error("Backend returned non-array:", data);
                    setPets([]);
                    return;
                }
                const petsWithEmoji = data.map((pet: any, index: number) => ({
                    ...pet,
                    id: index + 1,
                    emoji: typeEmojis[pet.type as PetType] || "🐾",
                }));
                setPets(petsWithEmoji);
            })
            .catch(err => console.error(err));
    }, [userId, token]); // rerun เมื่อ userId/token เปลี่ยน






    const [editingPet, setEditingPet] = useState<Pet | null>(null);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    const viewPetDetails = (pet: Pet) => {
        setSelectedPet(pet);
        setShowDetailModal(true);
    };

    const openEditModal = (pet: Pet) => {
        setEditingPet(pet);
        setForm({
            name: pet.name,
            type: pet.type,
            breed: pet.breed,
            birthdate: pet.birthdate,
            weight: pet.weight ? String(pet.weight) : "",
            gender: pet.gender,
            personality: pet.personality,
            medicalConditions: pet.medicalConditions,
            privacy: pet.privacy,
        });
        setShowEditModal(true);
    };

    const editPet = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingPet) return;

        const updatedPet = {
            ...form,
            type: form.type as PetType,
            weight: form.weight, // keep string
        };

        try {
            const res = await fetch(`http://localhost:3002/api/pets/${editingPet._id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedPet),
            });
            if (!res.ok) throw new Error("Failed to update pet");

            const savedPet = await res.json();
            setPets(
                pets.map((p) =>
                    p._id === editingPet._id
                        ? { ...savedPet, emoji: typeEmojis[savedPet.type as PetType] || "🐾" }
                        : p
                )
            );
            setShowEditModal(false);
            setEditingPet(null);
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
            console.error(err);
            alert("ไม่สามารถแก้ไขสัตว์เลี้ยงได้ โปรดลองอีกครั้ง");
        }
    };


    // เพิ่มฟังก์ชันลบสัตว์เลี้ยง
    const deletePet = async (petId: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบสัตว์เลี้ยงตัวนี้?")) return;

        try {
            const res = await fetch(`http://localhost:3002/api/pets/${petId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete pet");

            setPets(pets.filter((p) => p._id !== petId));
        } catch (err) {
            console.error(err);
            alert("ไม่สามารถลบสัตว์เลี้ยงได้ โปรดลองอีกครั้ง");
        }
    };






    return (
        <><Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold text-gray-800">สัตว์เลี้ยงของฉัน</h2>
                    <button
                        onClick={() => {
                            setForm({  // รีเซ็ตฟอร์มเป็นค่าเริ่มต้น
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
                            setShowModal(true);
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg"
                    >
                        ➕ เพิ่มสัตว์เลี้ยงใหม่
                    </button>

                </div>

                {/* Pets Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pets.map((pet) => (
                        <div key={pet._id} className="bg-white rounded-2xl p-6 shadow-md flex flex-col items-center">
                            <div className="text-5xl mb-2">{pet.emoji}</div>
                            <h3 className="text-xl font-bold">{pet.name}</h3>
                            <p className="text-gray-500">{pet.breed}</p>
                            <p className="text-gray-400 text-sm mt-1">น้ำหนัก: {pet.weight ?? "-"} กก.</p>
                            <p className="text-gray-400 text-sm">เพศ: {pet.gender || "-"}</p>
                            <p className="text-gray-400 text-sm">
                                สถานะ: {pet.privacy === "private" ? "🔒 ส่วนตัว" : "🌍 สาธารณะ"}
                            </p>

                            {/* Buttons */}
                            <div className="flex space-x-2 mt-4">
                                <button
                                    onClick={() => viewPetDetails(pet)}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-400 text-white rounded-xl text-sm"
                                >
                                    ดูรายละเอียด
                                </button>

                                <button
                                    onClick={() => openEditModal(pet)}
                                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm"
                                >
                                    แก้ไขข้อมูล
                                </button>

                                <button
                                    onClick={() => deletePet(pet._id)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm"
                                >
                                    ลบ
                                </button>

                            </div>
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
                                        type="date"
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
                                        เพิ่มสัตว์เลี้ยงใหม่
                                    </button>

                                </div>
                            </form>

                        </div>
                    </div>
                )}

                {/* Detail Modal */}
                {showDetailModal && selectedPet && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-8">
                            <h3 className="text-2xl font-bold mb-4">{selectedPet.name} {selectedPet.emoji}</h3>
                            <p><strong>ประเภท:</strong> {selectedPet.type}</p>
                            <p><strong>สายพันธุ์:</strong> {selectedPet.breed || "-"}</p>
                            <p><strong>วันเกิด:</strong> {selectedPet.birthdate || "-"}</p>
                            <p><strong>น้ำหนัก:</strong> {selectedPet.weight ?? "-"} กก.</p>
                            <p><strong>เพศ:</strong> {selectedPet.gender || "-"}</p>
                            <p><strong>นิสัย/บุคลิกภาพ:</strong> {selectedPet.personality || "-"}</p>
                            <p><strong>โรคประจำตัว/อาการแพ้:</strong> {selectedPet.medicalConditions || "-"}</p>
                            <p><strong>สถานะ:</strong> {selectedPet.privacy === "private" ? "🔒 ส่วนตัว" : "🌍 สาธารณะ"}</p>

                            <div className="flex justify-end mt-4">
                                <button
                                    onClick={() => setShowDetailModal(false)}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl"
                                >
                                    ปิด
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showEditModal && editingPet && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
                            <h3 className="text-2xl font-bold mb-6">แก้ไขข้อมูล {editingPet.name}</h3>
                            <form className="space-y-6" onSubmit={editPet}>
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
                                        type="date"
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

                                {/* ... */}
                                <div className="flex space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl transition-colors"
                                    >
                                        บันทึกการแก้ไข
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
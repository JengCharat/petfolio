"use client";

import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

type PetType = "dog" | "cat" | "bird" | "fish" | "rabbit" | "hamster";

interface Pet {
  _id: string;
  name: string;
  type: PetType;
  emoji?: string;
}

interface ReminderType {
  _id: string;
  petId: Pet | null;
  type: string;
  datetime: string;
  frequency: string;
  note: string;
  completed: boolean;
}

interface ReminderProps {
  userId: string;
}

export default function Reminder({ userId }: ReminderProps) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getPetEmoji = (type?: string) => {
    switch (type) {
      case "dog": return "🐶";
      case "cat": return "🐱";
      case "bird": return "🐦";
      case "rabbit": return "🐰";
      case "hamster": return "🐹";
      default: return "🐾";
    }
  };

  // โหลด Pets
  useEffect(() => {
    if (!userId) return;
    const fetchPets = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`http://localhost:3002/api/pets/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch pets");
        const data = await res.json();
        if (!Array.isArray(data)) return;
        setPets(data.map((p: any) => ({ ...p, emoji: p.emoji || getPetEmoji(p.type) })));
      } catch (err) {
        console.error(err);
      }
    };
    fetchPets();
  }, [userId]);

  // โหลด Reminders
  useEffect(() => {
    if (!userId) return;
    const fetchReminders = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:3002/api/reminders/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error("Failed to fetch reminders");
        const data = await res.json();
        if (!Array.isArray(data)) return;
        const formatted: ReminderType[] = data.map((r: any) => {
          const pet = pets.find(p => p._id === r.petId) || { _id: "", name: "ไม่ทราบ", type: "unknown", emoji: "🐾" };
          return { ...r, _id: r._id.toString().trim(), petId: pet };
        });
        setReminders(formatted);
      } catch (err) {
        console.error(err);
        setReminders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReminders();
  }, [userId, pets]);

  const toggleReminder = async (id: string) => {
    const cleanId = id.trim();
    try {
      const reminder = reminders.find(r => r._id === cleanId);
      if (!reminder) return;
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3002/api/reminders/${cleanId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ completed: !reminder.completed }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to toggle reminder");
      }
      const data = await res.json();
      setReminders(prev =>
        prev.map(r => r._id === cleanId ? { ...r, completed: data.completed } : r)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const getReminderTypeText = (type: string) => {
    const types: Record<string,string> = {
      food: "ให้อาหาร 🍽️",
      medicine: "ให้ยา 💊",
      exercise: "ออกกำลังกาย 🏃",
      grooming: "อาบน้ำ/ตัดขน ✂️",
      vet: "พบสัตวแพทย์ 🏥",
      vaccine: "วัคซีน 💉",
      deworming: "ถ่ายพยาธิ 🐛",
      info: "ข้อมูลสัตว์เลี้ยง 🐾",
    };
    return types[type] || type;
  };

  const getFrequencyText = (frequency: string) => {
    const frequencies: Record<string,string> = {
      once: "ครั้งเดียว",
      daily: "ทุกวัน",
      weekly: "ทุกสัปดาห์",
      monthly: "ทุกเดือน",
      yearly: "ทุกปี",
    };
    return frequencies[frequency] || frequency;
  };

  return (
    <div id="reminders" className="section">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">การแจ้งเตือน</h2>
          <button className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
            ➕ เพิ่มการแจ้งเตือน
          </button>
        </div>

        {isLoading ? (
          <p>กำลังโหลด...</p>
        ) : reminders.length === 0 ? (
          <p className="text-red-500">ไม่พบการแจ้งเตือนสำหรับผู้ใช้คนนี้</p>
        ) : (
          <div className="space-y-4">
            {reminders
              .sort((a,b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
              .map(r => {
                const pet = r.petId!;
                const datetime = new Date(r.datetime);
                const isOverdue = datetime < new Date() && !r.completed;
                const isToday = datetime.toDateString() === new Date().toDateString();
                return (
                  <div key={r._id} className={`bg-white rounded-xl p-6 shadow-lg ${isOverdue ? "border-l-4 border-red-500" : isToday ? "border-l-4 border-orange-500" : ""} ${r.completed ? "opacity-60" : ""}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{pet.emoji || getPetEmoji(pet.type)}</div>
                        <div>
                          <h3 className="font-bold text-gray-800">{getReminderTypeText(r.type)}</h3>
                          <p className="text-gray-600">{pet.name}</p>
                          <p className="text-sm text-gray-500">{datetime.toLocaleString("th-TH")}</p>
                          <p className="text-xs text-gray-400">ความถี่: {getFrequencyText(r.frequency)}</p>
                          {r.note && <p className="text-sm text-gray-600 mt-1">{r.note}</p>}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isOverdue && <span className="text-red-500 font-medium text-sm">เลยกำหนด!</span>}
                        {isToday && <span className="text-orange-500 font-medium text-sm">วันนี้!</span>}
                        <button onClick={()=>toggleReminder(r._id)} className={`px-4 py-2 rounded-lg transition-colors ${r.completed ? "bg-gray-200 text-gray-600":"bg-green-500 text-white hover:bg-green-600"}`}>
                          {r.completed ? "เสร็จแล้ว ✓" : "ทำเครื่องหมาย"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  );
}

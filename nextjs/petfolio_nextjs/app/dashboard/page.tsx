//@ts-nocheck
"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { addPetService } from "../services/pet_page_service";
import { useRouter } from 'next/navigation'
import { Router } from "next/router";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaTasks } from "react-icons/fa"; // สำหรับงานที่ยังไม่เสร็จ
import { FaPlus } from "react-icons/fa";
import { FaHeartbeat } from "react-icons/fa";
import { MdGroups } from "react-icons/md";



interface JWTData {
  id: string;
  email: string;
  username: string;
  iat: number;
  exp: number;
}

type PetType = "dog" | "cat" | "bird" | "fish" | "rabbit" | "hamster" | "unknown";

interface Pet {
  _id: string;
  name: string;
  type: PetType;
  emoji?: string;
}
interface ReminderType {
  _id: string;
  petId: Pet | null;
  title: string;
  date: string;
  time: string;
  details: string;
}

// --- Raw Reminder from API ---
interface RawReminder {
  _id: string;
  petId?: { _id: string } | null;
  title?: string;
  date?: string;
  time?: string;
  details?: string;
  completed?: boolean;
  petName?: string;
  petType?: string;
}


export default function First_page() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [userName, setUsername] = useState("");
  const [userId, setUserId] = useState(null);
  const [pets, setPets] = useState([]);
  const [eventsData, setEventsData] = useState({});
  const [isLoading, setIsLoading] = useState(true); // เพิ่ม state สำหรับการโหลด
  const [petCount, setPetCount] = useState<{ [key: string]: number }>({});
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  const [completedReminders, setCompletedReminders] = useState<ReminderType[]>([]);
  const [latestReminders, setLatestReminders] = useState<ReminderType[]>([]);
  const now = new Date();
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
  /////////////////////////////this is route //////////////////////////////////
  const GotoComunityPage = () => {
    router.push('community')
  }
  const GotoHealthPage = () => {
    router.push('health')
  }




  /////////////////////////////this is handle click //////////////////////////////////
  const handleAddPet = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");


    if (!userId || !token) {
      alert("กรุณา login ก่อน");
      return;
    }

    try {
      const savedPet = await addPetService(form, token, userId);

      if (String(savedPet.pet.owner?._id) === String(userId)) {
        setPets(prev => [...prev, savedPet.pet]);
      }

      setShowModal(false);
      setForm({ name: "", type: "", breed: "", birthdate: "", weight: "", gender: "", personality: "", medicalConditions: "", privacy: "private" });
      fetchPetCount()
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถเพิ่มสัตว์เลี้ยงได้");
    }
  };



  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };



  /////////////////////////////this is fetch data //////////////////////////////////
  useEffect(() => {
    // อ่าน token จาก localStorage
    const tokenRaw = localStorage.getItem("token");
    if (tokenRaw) {
      // ถ้า token เก็บมาแบบ "Bearer <token>" ให้ตัดคำว่า Bearer ออก
      const token = tokenRaw.startsWith("Bearer ")
        ? tokenRaw.split(" ")[1]
        : tokenRaw;
      try {
        const decoded = jwtDecode<JWTData>(token);
        if (decoded?.email) {
          setUserEmail(decoded.email);
          // alert(`Logged in as: ${decoded.email}`); // ถ้าต้องการ alert
        }
      } catch (err) {
        console.error("Invalid token", err);
      }
    }
  });

  useEffect(() => {
  const tokenRaw = localStorage.getItem("token");
  if (tokenRaw) {
    const token = tokenRaw.startsWith("Bearer ")
      ? tokenRaw.split(" ")[1]
      : tokenRaw;

    try {
      const decoded = jwtDecode<JWTData>(token);
      if (decoded?.username) {
        setUsername(decoded.username);
      }
    } catch (err) {
      console.error("Invalid token", err);
    }
  }
  }, []); //  เพิ่ม [] เพื่อให้รันแค่ครั้งเดียว




  const fetchPetCount = async () => {

    const userId = localStorage.getItem("userId");
    try {
      const res = await fetch(`http://127.0.0.1:3002/api/pets/petcount/${userId}`);
      if (!res.ok) throw new Error("Fail to fetch");

      const result = await res.json();
      const formatted = result.reduce((acc: any, item: any) => {
        acc[item.type] = item.count;
        return acc;
      }, {});
      setPetCount(formatted);
    } catch (err: any) {
      alert(err.message);
    }
  };

  useEffect(() => {

    fetchPetCount();
  }, []);

  ///////////////////////////////////////count this week task 

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    const fetchData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem("token");
      try {

        // Fetch Pets
        const petsRes = await fetch(`http://localhost:3002/api/pets/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const petsData: Pet[] = petsRes.ok ? await petsRes.json() : [];
        // const formattedPets = petsData.map(p => ({ ...p, emoji: p.emoji || getPetEmoji(p.type) }));
        // setPets(formattedPets);

        // Fetch Reminders
        const remRes = await fetch(`http://localhost:3002/api/reminders/user/${userId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!remRes.ok) throw new Error("Failed to fetch reminders");
        const remData: RawReminder[] = await remRes.json();

        const incomplete: ReminderType[] = [];
        const completed: ReminderType[] = [];

        remData.forEach((r) => {
          const reminderObj: ReminderType = {
            _id: r._id,
            // petId: pet,
            title: r.title || "กิจกรรม",
            date: r.date || "",
            time: r.time || "",
            details: r.details || ""
          };

          if (r.completed) completed.push(reminderObj);
          else incomplete.push(reminderObj);
        });

        setReminders(incomplete);
        setCompletedReminders(completed);
        const fetchReminders = async () => {
          try {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            const res = await fetch(`http://localhost:3002/api/reminders/user/${userId}`);
            if (!res.ok) throw new Error("Failed to fetch reminders");

            const data = await res.json();

            // sort ใหม่ให้ล่าสุดอยู่ข้างบน แล้วเอาแค่ 3 ตัว
            const latest = data
              .sort((a: ReminderType, b: ReminderType) =>
                new Date(b.date + " " + b.time).getTime() -
                new Date(a.date + " " + a.time).getTime()
              )
              .slice(0, 3);

            setReminders(latest);
          } catch (err) {
            console.error(err);
          }
        };
        fetchReminders();






//ดึงการแจ้งเตือนที่ยังไม่เสร็จ
        const fetchNotFinishedReminders = async () => {
          try {
            const userId = localStorage.getItem("userId");
            if (!userId) return;

            const res = await fetch(`http://localhost:3002/api/reminders/user/${userId}`);
            if (!res.ok) throw new Error("Failed to fetch reminders");

            const data: ReminderType[] = await res.json();

            //  กรองงานที่ยังไม่เสร็จ
            const notDone = data.filter((r) => !r.completed);
            setPendingCount(notDone.length);

            //  เอา 3 อันล่าสุด
            const latest = data
              .sort(
                (a, b) =>
                  new Date(b.date + " " + b.time).getTime() -
                  new Date(a.date + " " + a.time).getTime()
              )
              .slice(0, 3);

            setLatestReminders(latest);
          } catch (err) {
            console.error(err);
          }
        };

        fetchNotFinishedReminders()

      } catch (error: unknown) {
        console.error(error);
        setPets([]);
        setReminders([]);
        setCompletedReminders([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);
  const countThisWeek = reminders.filter(r => {
    const datetime = new Date(`${r.date}T${r.time}`);
    const day = now.getDay();
    const weekStart = new Date(now); weekStart.setDate(now.getDate() - day); weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart); weekEnd.setDate(weekStart.getDate() + 6); weekEnd.setHours(23, 59, 59, 999);
    return datetime >= weekStart && datetime <= weekEnd;
  }).length;

  /////////////////////////////this is return//////////////////////////////////
  return (
    <>
      <div className="font-sans  bg-[#fffff]">
        <Navbar />
        <div className="text-center p-6">
          <h1 className="text-4xl font-bold text-gray-800 mb-4 pt-10">สวัสดี {userName} </h1>
          <p className="text-xl text-gray-600">วันนี้สัตว์เลี้ยงของคุณเป็นอย่างไรบ้าง</p>
        </div>
        {/* Pet Count / Quick Stats */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition">
              <div className="text-3xl mb-2">🐱</div>
              <div className="text-xl font-bold text-black">{petCount.cat || 0}</div>
              <div className="text-gray-600 text-sm">แมว</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition">
              <div className="text-3xl mb-2">🐶</div>
              <div className="text-xl font-bold text-black">{petCount.dog || 0}</div>
              <div className="text-gray-600 text-sm">สุนัข</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition">
              <div className="text-3xl mb-2">🐦</div>
              <div className="text-xl font-bold text-black">{petCount.bird || 0}</div>
              <div className="text-gray-600 text-sm">นก</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition">
              <div className="text-3xl mb-2">🐠</div>
              <div className="text-xl font-bold text-black">{petCount.fish || 0}</div>
              <div className="text-gray-600 text-sm">ปลา</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition">
              <div className="text-3xl mb-2">🐰</div>
              <div className="text-xl font-bold text-black">{petCount.rabbit || 0}</div>
              <div className="text-gray-600 text-sm">กระต่าย</div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center hover:shadow-xl transition">
              <div className="text-3xl mb-2">🐹</div>
              <div className="text-xl font-bold text-black">{petCount.hamster || 0}</div>
              <div className="text-gray-600 text-sm">แฮมสเตอร์</div>
            </div>
          </div>
<div className="grid grid-cols-3 gap-6 mb-8 mt-16">

  {/* การแจ้งเตือนล่าสุด */}
  <div className="bg-white rounded-2xl p-6 shadow-lg col-span-2 row-span-2">
    <h2 className="text-xl font-bold mb-4 text-black">การแจ้งเตือนล่าสุด</h2>
    {latestReminders.length === 0 ? (
      <p className="text-gray-400 font-semibold">ไม่มีแจ้งเตือน</p>
    ) : (
      <div className="space-y-4">
        {latestReminders.map((reminder, index) => (
          <div
            key={reminder._id}
            className={`flex items-start p-4 rounded-xl shadow-md transition ${index % 2 === 0
              ? "bg-gradient-to-r from-cyan-50 to-cyan-100"
              : "bg-gradient-to-r from-green-50 to-green-100"
              }`}
          >
            <div className="text-2xl mr-4">
              {index % 2 === 0 ? "💡" : "⚠️"}
            </div>
            <div className="flex-1">
              <p className="font-bold text-gray-800">{reminder.title}</p>
              <p className="text-sm text-gray-500">
                {reminder.date} {reminder.time}
              </p>
              <p className="text-gray-700">{reminder.details}</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>

  {/* สัปดาห์นี้ */}
  <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2
                  col-span-1 row-span-1">
    <FaRegCalendarAlt className="text-blue-500 text-3xl mb-2" />
    <div className="text-lg font-bold text-blue-500">สัปดาห์นี้</div>
    <div className="text-md text-blue-400">{countThisWeek} รายการ</div>
  </div>

  {/* งานที่ยังไม่เสร็จ */}
  <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-6 text-center flex flex-col items-center justify-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2
                  col-span-1 row-span-1">
    <FaTasks className="text-yellow-500 text-3xl mb-2" />
    <div className="text-lg font-bold text-yellow-500">งานที่ยังไม่เสร็จ</div>
    <div className="text-md text-yellow-400">{pendingCount} รายการ</div>
  </div>

</div>




          {/* Action Buttons */}
          <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-8 mt-16">

  {/* เพิ่มสัตว์เลี้ยงใหม่ */}
  <button
    onClick={() => {
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
      setShowModal(true);
    }}
    className="bg-purple-500 rounded-2xl p-6 shadow-xl text-center hover:shadow-xl transition flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 "
  >
    <FaPlus className="text-white text-4xl mb-3" />
    <h3 className="text-lg font-bold mb-1 text-white">เพิ่มสัตว์เลี้ยงใหม่</h3>
    <p className="text-sm text-white/90">เพิ่มสมาชิกใหม่ในครอบครัว</p>
  </button>

  {/* บันทึกสุขภาพ */}
  <button
    onClick={GotoHealthPage}
    className="bg-green-500 rounded-2xl p-6 shadow-xl text-center hover:shadow-xl transition flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
  >
    <FaHeartbeat className="text-white text-4xl mb-3" />
    <h3 className="text-lg font-bold mb-1 text-white">บันทึกสุขภาพ</h3>
    <p className="text-sm text-white/90">อัปเดตข้อมูลการดูแล</p>
  </button>

  {/* แชร์ในคอมมูนิตี้ */}
  <button
    onClick={GotoComunityPage}
    className="bg-cyan-500 rounded-2xl p-6 shadow-xl text-center hover:shadow-xl transition flex flex-col items-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
  >
    <MdGroups className="text-white text-4xl mb-3" />
    <h3 className="text-lg font-bold mb-1 text-white">แชร์ในคอมมูนิตี้</h3>
    <p className="text-sm text-white/90">อวดสัตว์เลี้ยงน่ารักของคุณ</p>
  </button>

</div>

        </div>

        {/* Modal Section */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8 shadow-xl">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มสัตว์เลี้ยงใหม่</h3>
              <form className="space-y-6" onSubmit={handleAddPet}>
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
      </div>
    </>
  );


}







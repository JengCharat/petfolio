"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
import { addPetService } from "../services/pet_page_service";
import { useRouter } from 'next/navigation'
import { Router } from "next/router";
interface JWTData {
  id: string;
  email: string;
  iat: number;
  exp: number;
}



export default function First_page() {
    const router = useRouter()

  const [userEmail, setUserEmail] = useState("");
        const GotoComunityPage = () => {
           router.push('community') 
        }

        const GotoHealthPage = () => {
           router.push('health') 
        }
  //
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
      setForm({ name:"", type:"", breed:"", birthdate:"", weight:"", gender:"", personality:"", medicalConditions:"", privacy:"private" });

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








    const [userId, setUserId] = useState(null);
    const [pets, setPets] = useState([]);
    const [eventsData, setEventsData] = useState({});
    const [isLoading, setIsLoading] = useState(true); // เพิ่ม state สำหรับการโหลด

    useEffect(() => {
        const fetchUserData = async () => {
            const token = localStorage.getItem('token');
            const currentUserId = localStorage.getItem('userId');

            if (!token || !currentUserId) {
                console.error("Token or userId not found. User is not logged in.");
                setUserId(null);
                setPets([]);
                setEventsData({});
                setIsLoading(false); // หยุดการโหลด
                return;
            }

            try {

                // ดึงข้อมูลสัตว์เลี้ยงของผู้ใช้
                const petsResponse = await fetch(`http://localhost:3002/api/pets/user/${currentUserId}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (petsResponse.ok) {
                    const petsData = await petsResponse.json();
                    setPets(petsData);
                } else {
                    console.error(`Failed to fetch pets: ${petsResponse.status}`);
                    setPets([]);
                }

                // ดึงข้อมูลกิจกรรมของผู้ใช้คนนี้
                const eventsResponse = await fetch(`http://localhost:3002/api/reminders/user/${currentUserId}`, { /* ... */ });
                if (!eventsResponse.ok) {
                    throw new Error('Failed to fetch events');
                }
                const data = await eventsResponse.json();
                const formattedData = data.reduce((acc, event) => {
                    const dateKey = event.date;
                    if (!acc[dateKey]) {
                        acc[dateKey] = [];
                    }
                    acc[dateKey].push(event);
                    return acc;
                }, {});
                setEventsData(formattedData);

            } catch (error) {
                console.error("Failed to fetch data:", error);
            } finally {
                setIsLoading(false); // ไม่ว่าจะสำเร็จหรือล้มเหลว ให้หยุดการโหลด
            }
        };

        fetchUserData();
    }, []);









    const [petCount,setPetCount] = useState(0)
    useEffect(()=>{
        const fetchPetCount = async () => {
            try{
                const res = await fetch('http://127.0.0.1:3002/api/pets/petcount/9PefA6P1uQMHjdCisXQZk')
                if(!res.ok){
                    throw new Error('Fail to fetch')
                }
                const result = await res.json()
                setPetCount(result)
        }catch(err){
                alert(err)
            }
        }
        fetchPetCount()

    },[])




















      return (
        <>
          <Navbar />
          {userEmail && (
            <p className="mb-2 text-green-600">Logged in as: {userEmail}</p>
          )}
            <h1 className="text-red-200 text-3xl">this is pet count: {petCount}</h1>

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
                        
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
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

            <button  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg" onClick={GotoHealthPage}>
                บันทึกสุขภาพ
            </button>
            <button  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg" onClick={GotoComunityPage}>
                คอมมูนิตี้สัตว์เลี้ยง
            </button>































        </>
      );
}



    



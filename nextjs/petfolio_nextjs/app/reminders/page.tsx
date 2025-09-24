"use client"
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";

export default function Reminder({ pets, updateStats }) {
  const [reminders, setReminders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    petId: "",
    type: "",
    datetime: "",
    frequency: "once",
    note: ""
  });

  // โหลดค่า datetime เริ่มต้น
  useEffect(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    setFormData(prev => ({ ...prev, datetime: now.toISOString().slice(0, 16) }));
  }, []);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ petId: "", type: "", datetime: "", frequency: "once", note: "" });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReminder = {
      id: reminders.length + 1,
      petId: parseInt(formData.petId),
      type: formData.type,
      datetime: formData.datetime,
      frequency: formData.frequency,
      note: formData.note,
      completed: false
    };
    setReminders([newReminder, ...reminders]);
    updateStats && updateStats();
    closeModal();
  };

  const toggleReminder = (id) => {
    setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
    updateStats && updateStats();
  };

  const getReminderTypeText = (type) => {
    const types = {
      food: 'ให้อาหาร 🍽️',
      medicine: 'ให้ยา 💊',
      exercise: 'ออกกำลังกาย 🏃',
      grooming: 'อาบน้ำ/ตัดขน ✂️',
      vet: 'พบสัตวแพทย์ 🏥',
      vaccine: 'วัคซีน 💉',
      deworming: 'ถ่ายพยาธิ 🐛'
    };
    return types[type] || type;
  };

  const getFrequencyText = (frequency) => {
    const frequencies = {
      once: 'ครั้งเดียว',
      daily: 'ทุกวัน',
      weekly: 'ทุกสัปดาห์',
      monthly: 'ทุกเดือน',
      yearly: 'ทุกปี'
    };
    return frequencies[frequency] || frequency;
  };

  return (
    <div id="reminders" className="section">
      {/* Navbar */}
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">การแจ้งเตือน</h2>
          <button onClick={openModal} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
            ➕ เพิ่มการแจ้งเตือน
          </button>
        </div>

        {/* Reminders List */}
        <div id="remindersList" className="space-y-4">
          {reminders.sort((a,b)=> new Date(a.datetime)-new Date(b.datetime)).map(reminder => {
            const pet = pets.find(p => p.id === reminder.petId);
            const datetime = new Date(reminder.datetime);
            const isOverdue = datetime < new Date() && !reminder.completed;
            const isToday = datetime.toDateString() === new Date().toDateString();
            return (
              <div key={reminder.id} className={`bg-white rounded-xl p-6 shadow-lg ${isOverdue ? 'border-l-4 border-red-500' : isToday ? 'border-l-4 border-orange-500' : ''} ${reminder.completed ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-3xl">{pet ? pet.emoji : '🐾'}</div>
                    <div>
                      <h3 className="font-bold text-gray-800">{getReminderTypeText(reminder.type)}</h3>
                      <p className="text-gray-600">{pet ? pet.name : 'ไม่ทราบ'}</p>
                      <p className="text-sm text-gray-500">{datetime.toLocaleString('th-TH')}</p>
                      <p className="text-xs text-gray-400">ความถี่: {getFrequencyText(reminder.frequency)}</p>
                      {reminder.note && <p className="text-sm text-gray-600 mt-1">{reminder.note}</p>}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {isOverdue && <span className="text-red-500 font-medium text-sm">เลยกำหนด!</span>}
                    {isToday && <span className="text-orange-500 font-medium text-sm">วันนี้!</span>}
                    <button onClick={() => toggleReminder(reminder.id)} className={`px-4 py-2 rounded-lg transition-colors ${reminder.completed ? 'bg-gray-200 text-gray-600' : 'bg-green-500 text-white hover:bg-green-600'}`}>
                      {reminder.completed ? 'เสร็จแล้ว ✓' : 'ทำเครื่องหมาย'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reminder Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มการแจ้งเตือน</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* ฟอร์มเลือกสัตว์เลี้ยง */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">เลือกสัตว์เลี้ยง *</label>
                  <select value={formData.petId} onChange={e=>setFormData({...formData, petId:e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                    <option value="">เลือกสัตว์เลี้ยง</option>
                    {pets.map(pet => <option key={pet.id} value={pet.id}>{pet.emoji} {pet.name}</option>)}
                  </select>
                </div>

                {/* ฟอร์มประเภท */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">ประเภทการแจ้งเตือน *</label>
                  <select value={formData.type} onChange={e=>setFormData({...formData, type:e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required>
                    <option value="">เลือกประเภท</option>
                    <option value="food">ให้อาหาร 🍽️</option>
                    <option value="medicine">ให้ยา 💊</option>
                    <option value="exercise">ออกกำลังกาย 🏃</option>
                    <option value="grooming">อาบน้ำ/ตัดขน ✂️</option>
                    <option value="vet">พบสัตวแพทย์ 🏥</option>
                    <option value="vaccine">วัคซีน 💉</option>
                    <option value="deworming">ถ่ายพยาธิ 🐛</option>
                  </select>
                </div>

                {/* วันที่เวลา */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">วันที่และเวลา *</label>
                  <input type="datetime-local" value={formData.datetime} onChange={e=>setFormData({...formData, datetime:e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" required />
                </div>

                {/* ความถี่ */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">ความถี่</label>
                  <select value={formData.frequency} onChange={e=>setFormData({...formData, frequency:e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                    <option value="once">ครั้งเดียว</option>
                    <option value="daily">ทุกวัน</option>
                    <option value="weekly">ทุกสัปดาห์</option>
                    <option value="monthly">ทุกเดือน</option>
                    <option value="yearly">ทุกปี</option>
                  </select>
                </div>

                {/* หมายเหตุ */}
                <div>
                  <label className="block text-gray-700 font-medium mb-2">หมายเหตุ</label>
                  <textarea value={formData.note} onChange={e=>setFormData({...formData, note:e.target.value})} rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent" placeholder="เพิ่มรายละเอียด..."></textarea>
                </div>

                {/* ปุ่ม */}
                <div className="flex space-x-4 pt-4">
                  <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">ยกเลิก</button>
                  <button type="submit" className="flex-1 px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl transition-colors">เพิ่มการแจ้งเตือน</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

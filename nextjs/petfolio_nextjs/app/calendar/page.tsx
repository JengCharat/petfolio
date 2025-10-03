"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function Calendar() {
    const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [eventsData, setEventsData] = useState({});
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [pets, setPets] = useState([]);
    const [userId, setUserId] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // เพิ่ม state สำหรับการโหลด
    const [selectedDate, setSelectedDate] = useState(null); //เพิ่มคลิกในปฎิทิน
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
                setUserId(currentUserId);

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

    const [selectedPets, setSelectedPets] = useState([]);
    const handlePetChange = (petId) => {
        setSelectedPets(prev =>
            prev.includes(petId)
                ? prev.filter(p => p !== petId)
                : [...prev, petId]
        );
    };

    const handleViewDetails = (event) => {
        setSelectedEvent(event);
        setIsDetailModalOpen(true);
    };

    const showReminderModal = () => {
        setIsReminderModalOpen(true);
    };

    const hideReminderModal = () => {
        setIsReminderModalOpen(false);
    };

    const goToPreviousMonth = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prevDate => new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 1));
    };

    const renderCalendar = (year, month) => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const numDays = lastDay.getDate();
        const firstDayIndex = firstDay.getDay();

        let calendarDays = [];

        for (let i = 0; i < firstDayIndex; i++) {
            calendarDays.push(<div key={`empty-${i}`} className="p-2 text-center text-gray-400"></div>);
        }

        for (let day = 1; day <= numDays; day++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const dayEvents = eventsData[dateStr] || [];

            calendarDays.push(
                <div
                    key={day}
                    className="p-2 border border-gray-200 rounded-lg h-24 relative overflow-hidden cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleDayClick(dateStr)} // <--- เพิ่ม onClick ที่นี่
                >
                    <div className="font-bold text-gray-800">{day}</div>
                    <div className="mt-1 space-y-1">
                        {dayEvents.map((event, index) => (
                            <div key={index} className="bg-purple-100 text-purple-700 rounded-full px-2 py-0.5 text-xs truncate">
                                {event.title}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        return calendarDays;

    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;

        const datetime = form.elements['datetime-local'].value;
        const [date, time] = datetime.split('T');
        const petId = form.elements.petId.value;

        const selectedPet = pets.find(pet => pet._id === petId);
        const petName = selectedPet ? selectedPet.name : '';

        // ใช้ userId ที่มาจาก state ซึ่งเป็นค่าที่ถูกต้องตามที่ดึงมา
        const newReminder = {
            title: form.elements.title.value,
            date: date,
            time: time,
            petId: petId,
            // petName: petName,
            details: form.elements.details.value,
            userId: userId
        };

        try {
            const response = await fetch('http://localhost:3002/api/reminders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newReminder),
            });

            if (!response.ok) {
                throw new Error('Failed to save reminder');
            }

            hideReminderModal();
            window.location.reload();

        } catch (error) {
            console.error("Failed to save reminder:", error);
            alert("เกิดข้อผิดพลาดในการบันทึกกิจกรรม");
        }
    };
    const handleDayClick = (dateStr) => { //เรียกใช้เวลากดบนปฎิทิน
        setSelectedDate(`${dateStr}T00:00`);
        showReminderModal();
    };

    const handleDeleteReminder = async (reminderId) => {
        if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบการแจ้งเตือนนี้?")) {
            try {
                const response = await fetch(`http://localhost:3002/api/reminders/${reminderId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    throw new Error('Failed to delete reminder');
                }
                window.location.reload();

            } catch (error) {
                console.error("Failed to delete reminder:", error);
                alert("เกิดข้อผิดพลาดในการลบกิจกรรม");
            }
        }
    };
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const monthNames = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    return (
        <>
            <Navbar />
            <div id="calendar" >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">ปฏิทินการดูแล</h2>
                        <div className="flex space-x-4">
                            <button onClick={showReminderModal} className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-lg">
                                ➕ เพิ่มการแจ้งเตือน
                            </button>
                           
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">{monthNames[currentMonth]} {currentYear}</h3>
                            <div className="flex space-x-2">
                                <button onClick={goToPreviousMonth} className="px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors">‹ ก่อนหน้า</button>
                                <button onClick={goToNextMonth} className="px-4 py-2 text-gray-600 hover:text-purple-600 transition-colors">ถัดไป ›</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-7 gap-1 mb-4">
                            <div className="text-center font-medium text-gray-600 py-2">อา</div>
                            <div className="text-center font-medium text-gray-600 py-2">จ</div>
                            <div className="text-center font-medium text-gray-600 py-2">อ</div>
                            <div className="text-center font-medium text-gray-600 py-2">พ</div>
                            <div className="text-center font-medium text-gray-600 py-2">พฤ</div>
                            <div className="text-center font-medium text-gray-600 py-2">ศ</div>
                            <div className="text-center font-medium text-gray-600 py-2">ส</div>
                        </div>
                        <div id="calendarGrid" className="grid grid-cols-7 gap-1">
                            {renderCalendar(currentYear, currentMonth)}
                        </div>
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">กิจกรรมที่จะมาถึง</h3>
                        <div className="space-y-4" id="upcomingEvents">
                            {Object.values(eventsData).flat().length > 0 ? (
                                Object.values(eventsData).flat().map((event, index) => (
                                    <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl">
                                        <div className="text-2xl text-orange-500">⏰</div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-800">{event.title} - **{event.petId.name}**</p>
                                            <p className="text-sm text-gray-600">วันที่: {event.date} เวลา: {event.time}</p>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleViewDetails(event)} className="text-blue-600 hover:text-blue-800 transition-colors" >ดูรายละเอียด</button>
                                            <button onClick={() => handleDeleteReminder(event._id)} className="text-red-600 hover:text-red-800 transition-colors">ลบ</button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center text-gray-500 py-8">ไม่มีกิจกรรมที่จะมาถึง</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {isReminderModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">เพิ่มการแจ้งเตือนใหม่</h3>
                        <form onSubmit={handleFormSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">ชื่อการแจ้งเตือน *</label>
                                <input type="text" name="title" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" required />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">เลือกสัตว์เลี้ยง</label>
                                <select name="petId" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500">
                                    <option value="">-- เลือกสัตว์เลี้ยง --</option>
                                    {pets.length > 0 ? (
                                        pets.map(pet => (
                                            <option key={pet._id} value={pet._id}>{pet.name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>คุณยังไม่มีสัตว์เลี้ยง</option>
                                    )}
                                </select>
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">วันที่และเวลา *</label>
                                <input
                                    type="datetime-local"
                                    name="datetime-local"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500"
                                    value={selectedDate || ''} // <--- ใช้ 'value' แทน 'defaultValue'
                                    onChange={(e) => setSelectedDate(e.target.value)} // <--- เพิ่ม onChange handler
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">รายละเอียด</label>
                                <textarea name="details" rows="3" className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" placeholder="รายละเอียดเพิ่มเติม..."></textarea>
                            </div>
                            <div className="flex justify-end space-x-4 pt-4">
                                <button type="button" onClick={hideReminderModal} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">ยกเลิก</button>
                                <button type="submit" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl">บันทึก</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {isDetailModalOpen && selectedEvent && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-xl w-full p-8 shadow-2xl">
                        <h3 className="text-2xl font-bold text-gray-800 mb-6">รายละเอียดกิจกรรม</h3>
                        <p>ชื่อกิจกรรม: {selectedEvent.title}</p>
                        <p>สัตว์เลี้ยง: {selectedEvent.petId.name}</p>
                        <p>วันที่: {selectedEvent.date}</p>
                        <p>เวลา: {selectedEvent.time}</p>
                        <p>รายละเอียด: {selectedEvent.details}</p>
                        <button
                            onClick={() => setIsDetailModalOpen(false)}
                            className="mt-4 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50">
                            ปิด
                        </button>
                        <button
                            onClick={() => handleDeleteReminder(selectedEvent._id)}
                            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl">
                            ลบ
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
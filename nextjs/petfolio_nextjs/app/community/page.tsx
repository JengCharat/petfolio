"use client"
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Community() {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState([]);
  const [postDesc, setPostDesc] = useState("");
  const [images, setImages] = useState<File[]>([]); // กำหนด type ให้ชัดเจน

  useEffect(() => {
    async function fetchData() {
      try {
        // ดึง user ปัจจุบัน
        const userRes = await fetch("/api/user/me");
        if (!userRes.ok) throw new Error("Failed to fetch user");
        const userData = await userRes.json();
        setUser(userData);

        // ดึง pets ของ user
        const petsRes = await fetch(`/api/pets/user/${userData._id}`);
        if (!petsRes.ok) throw new Error("Failed to fetch pets");
        const petsData = await petsRes.json();
        setPets(petsData);
      } catch (err) {
        console.error("Error fetching user or pets:", err);
      }
    }

    fetchData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f5f5f5]">
      <Navbar />

      <div className="flex px-80 gap-4 items-start mt-8">
        {/* Left Sidebar */}
        <div className="border w-64 border-gray-300 px-4 pt-8 sticky top-32 self-start">
          <p className="text-black">ตัวกรอง</p>
        </div>

        {/* Center Column */}
        <div className="flex-1 flex flex-col space-y-4 border-l border-r">
          {/* Create Post */}
          <div className="border-b border-gray-300 pt-12 w-full">
            <div className="p-4 text-black">
              <form
                action="/api/community"
                method="POST"
                encType="multipart/form-data"
                className="flex flex-col gap-2"
              >
                <label htmlFor="postDesc">Post Description:</label>
                <input
                  type="text"
                  id="postDesc"
                  name="PostDesc"
                  className="border p-1"
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  required
                />

                <label>Upload Images:</label>
                <input
                  type="file"
                  name="images"
                  multiple
                  className="border p-1"
                  onChange={(e) => {
                    if (e.target.files) setImages(Array.from(e.target.files));
                  }}
                />

                <label>Select Your Pets:</label>
                <div className="flex flex-col gap-1">
                  {pets.length > 0 ? (
                    pets.map((pet) => (
                      <label key={pet._id}>
                        <input type="checkbox" name="pets" value={pet._id} />
                        {pet.name} ({pet.type})
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500">คุณยังไม่มีสัตว์เลี้ยง</p>
                  )}
                </div>

                <button type="submit" className="border p-2 mt-2">
                  Submit
                </button>
              </form>
            </div>
          </div>

          {/* FEED */}
          <div className="rounded-lg w-full">
            {/* แสดงโพสต์ที่นี่ */}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="border w-64 border-gray-300 px-4 pt-8 sticky top-32 self-start">
          <p className="text-black">โพสต์ยอดนิยม</p>
        </div>
      </div>
    </div>
  );
}

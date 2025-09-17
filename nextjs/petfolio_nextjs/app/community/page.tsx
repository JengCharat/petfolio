"use client";
import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Community() {
  const [userId, setUserId] = useState<string | null>(null); // จะเป็น userId (string custom id)
  const [token, setToken] = useState<string | null>(null);
  const [pets, setPets] = useState<{ _id: string; name: string }[]>([]);
  const [postDesc, setPostDesc] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  // ดึง userId และ token จาก localStorage
  useEffect(() => {
    setUserId(localStorage.getItem("userId")); // ใช้ userId (string) จาก localStorage
    setToken(localStorage.getItem("token"));
  }, []);

  // ดึง pets ของ user (owner = userId)
  useEffect(() => {
    if (!userId || !token) return;
    fetch(`http://localhost:3002/api/pets/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return setPets([]);
        setPets(data);
      })
      .catch((err) => console.error("Error fetching pets:", err));
  }, [userId, token]);

  // ดึงโพสต์ทั้งหมด
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3002/api/community-posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data.reverse());
      })
      .catch((err) => console.error("Error fetching posts:", err));
  }, [token]);

  const handlePetChange = (petId: string) => {
    setSelectedPets((prev) =>
      prev.includes(petId) ? prev.filter((p) => p !== petId) : [...prev, petId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !token) return;

    const formData = new FormData();
    formData.append("PostDesc", postDesc);
    formData.append("owner", userId); // ส่ง userId (string) ไปที่ backend
    selectedPets.forEach((petId) => formData.append("pets", petId));
    images.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("http://localhost:3002/api/community-posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create post");
      }

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);

      // รีเซ็ต form
      setPostDesc("");
      setImages([]);
      setSelectedPets([]);
    } catch (err) {
      console.error("Error creating post:", err);
      alert("สร้างโพสต์ไม่สำเร็จ ลองเช็ค console");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f5f5f5]">
      <Navbar />
      <div className="flex px-60 gap-4 items-start mt-8">
        <div className="w-64 px-4 pt-8 sticky top-32 self-start">
          <p className="text-black">ตัวกรอง</p>
        </div>

        <div className="flex-1 flex flex-col space-y-4 border-l border-r border-gray-300">
          {/* Create Post */}
          <div className="border-b border-gray-300 pt-12 w-full">
            <div className="p-4 text-black">
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="flex flex-col gap-2"
              >
                <label>Post Description:</label>
                <input
                  type="text"
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  className="border p-1"
                  required
                />

                <label>Upload Images:</label>
                <input
                  type="file"
                  multiple
                  onChange={(e) =>
                    e.target.files && setImages(Array.from(e.target.files))
                  }
                  className="border p-1"
                />

                <label>Select Your Pets:</label>
                <div className="flex flex-col gap-1">
                  {pets.length > 0 ? (
                    pets.map((pet) => (
                      <label key={pet._id}>
                        <input
                          type="checkbox"
                          value={pet._id}
                          checked={selectedPets.includes(pet._id)}
                          onChange={() => handlePetChange(pet._id)}
                        />
                        {pet.name}
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
          <div className="rounded-lg w-full p-4 space-y-4">
            {posts.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีโพสต์</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="border p-4 rounded bg-white space-y-2"
                >
                  <p className="font-semibold">{post.PostDesc}</p>
                  <p className="text-gray-500">
                    Pets: {post.pets.map((p: any) => p.name).join(", ")}
                  </p>
                  {post.images.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {post.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={`http://localhost:3002${img}`}
                          alt={`post-${idx}`}
                          className="w-32 h-32 object-cover rounded"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="w-64 px-4 pt-8 sticky top-32 self-start">
          <p className="text-black">โพสต์ยอดนิยม</p>
        </div>
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

export default function Community() {
  const [currentUser, setCurrentUser] = useState<{ _id: string } | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pets, setPets] = useState<{ _id: string; name: string }[]>([]);
  const [postDesc, setPostDesc] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // ดึง token และ currentUserId จาก localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    setToken(storedToken);
    if (storedUserId) {
      setCurrentUser({ _id: storedUserId });
    }
  }, []);

  // ดึงข้อมูล pets ของ current user
  useEffect(() => {
    if (!token || !currentUser) return;

    fetch(`http://localhost:3002/api/pets/user/${currentUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching pets:", err));
  }, [token, currentUser]);

  // ดึง posts ทั้งหมด
  useEffect(() => {
    if (!token) return;

    fetch("http://localhost:3002/api/community-posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setPosts(data.reverse()))
      .catch((err) => console.error("Error fetching posts:", err));
  }, [token]);

  // ดึงโพสต์ของ current user
  useEffect(() => {
    if (!token || !currentUser) return;

    fetch(`http://localhost:3002/api/community-posts/user/${currentUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMyPosts(Array.isArray(data) ? data : [])) // ไม่ต้อง reverse แล้ว
      .catch((err) => console.error("Error fetching my posts:", err));
  }, [token, currentUser]);


  const handlePetChange = (petId: string) => {
    setSelectedPets((prev) =>
      prev.includes(petId) ? prev.filter((p) => p !== petId) : [...prev, petId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentUser) return;

    const formData = new FormData();
    formData.append("PostDesc", postDesc);
    formData.append("owner", currentUser._id); // ใช้ currentUser._id
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

      // เพิ่มโพสต์ใหม่ทั้ง feed และ myPosts
      setPosts((prev) => [newPost, ...prev]);
      setMyPosts((prev) => [newPost, ...prev]);

      // รีเซ็ต form
      setPostDesc("");
      setImages([]);
      setSelectedPets([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error creating post:", err);
      alert("สร้างโพสต์ไม่สำเร็จ ลองเช็ค console");
    }
  };

  return (
    <div className="flex flex-col min-h-screen w-full bg-[#f5f5f5]">
      <Navbar />
      <div className="flex px-48 gap-4 items-start">
        {/* Sidebar */}
        <div className="w-64 px-4 pt-8 sticky top-32 self-start">
          <p className="text-black">หน้าคอมมูนิตี้</p>
        </div>

        {/* Main Feed */}
        <div className="flex-1 flex flex-col space-y-4 border-l border-r border-gray-300">
          {/* Create Post */}
          <div className="border-b border-gray-300 pt-20 w-full">
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
                  ref={fileInputRef}
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

          {/* Feed Posts */}
          <div className="w-full space-y-4">
            {posts.length === 0 ? (
              <p className="text-gray-500">ยังไม่มีโพสต์</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="border-gray-300 border-b py-4 space-y-3"
                >
                  <p className="font-bold text-lg pl-4 text-black">
                    {post.pets.map((p: any) => p.name).join(", ")}
                  </p>
                  <p className="text-gray-800 text-base pl-8">{post.PostDesc}</p>
                  {post.images.length > 0 && (
                    <div className="flex flex-col gap-3 p-4">
                      {post.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={`http://localhost:3002${img}`}
                          alt={`post-${idx}`}
                          className="w-full max-h-[500px] object-cover rounded-xl"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Posts */}
        <div className="w-64 px-4 pt-22 top-32 self-start">
          <p className="text-black font-bold mb-4">โพสต์ของฉัน</p>
          <div className="space-y-4">
            {currentUser ? (
              myPosts.length === 0 ? (
                <p className="text-gray-500">คุณยังไม่มีโพสต์</p>
              ) : (
                myPosts.map((post) => (
                  <div
                    key={post._id}
                    className="border border-gray-200 rounded-lg p-3 space-y-2 bg-white"
                  >
                    <p className="font-semibold text-black">
                      {post.pets.map((p: any) => p.name).join(", ")}
                    </p>
                    <p className="text-gray-700 text-sm">{post.PostDesc}</p>
                    {post.images.length > 0 && (
                      <img
                        src={`http://localhost:3002${post.images[0]}`}
                        alt="my-post"
                        className="w-full max-h-[150px] object-cover rounded-md"
                      />
                    )}
                  </div>
                ))
              )
            ) : (
              <p className="text-gray-500">กำลังโหลดข้อมูลผู้ใช้...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

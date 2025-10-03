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
  const [openImage, setOpenImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // โหลด token และ userId
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUserId = localStorage.getItem("userId");
    setToken(storedToken);
    if (storedUserId) {
      setCurrentUser({ _id: storedUserId });
    }
  }, []);

  // โหลดสัตว์เลี้ยง
  useEffect(() => {
    if (!token || !currentUser) return;
    fetch(`http://localhost:3002/api/pets/user/${currentUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setPets(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching pets:", err));
  }, [token, currentUser]);

  // โหลดโพสต์ทั้งหมด
  useEffect(() => {
    if (!token) return;
    fetch("http://localhost:3002/api/community-posts", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => Array.isArray(data) && setPosts(data.reverse()))
      .catch((err) => console.error("Error fetching posts:", err));
  }, [token]);

  // โหลดโพสต์ของฉัน
  useEffect(() => {
    if (!token || !currentUser) return;
    fetch(`http://localhost:3002/api/community-posts/user/${currentUser._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setMyPosts(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Error fetching my posts:", err));
  }, [token, currentUser]);

  // เปลี่ยน pet ที่เลือก
  const handlePetChange = (petId: string) => {
    setSelectedPets((prev) =>
      prev.includes(petId) ? prev.filter((p) => p !== petId) : [...prev, petId]
    );
  };

  // ส่งโพสต์ใหม่
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !currentUser) return;

    const formData = new FormData();
    formData.append("PostDesc", postDesc);
    formData.append("owner", currentUser._id);
    selectedPets.forEach((petId) => formData.append("pets", petId));
    images.forEach((file) => formData.append("images", file));

    try {
      const res = await fetch("http://localhost:3002/api/community-posts", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        // ✅ แสดงป็อปอัป error
        alert(data.error);
        return;
      }

      const newPost = await res.json();
      setPosts((prev) => [newPost, ...prev]);
      setMyPosts((prev) => [newPost, ...prev]);

      // reset form
      setPostDesc("");
      setImages([]);
      setSelectedPets([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Error creating post:", err);
    }
  };

  // ลบโพสต์
  const handleDelete = async (postId: string) => {
    if (!token) return;
    if (!confirm("คุณแน่ใจว่าต้องการลบโพสต์นี้?")) return;

    try {
      const res = await fetch(
        `http://localhost:3002/api/community-posts/${postId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) throw new Error("Failed to delete post");

      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setMyPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  return (
    <div className="font-sans flex flex-col min-h-screen w-full bg-[#f5f5f5]">
      <Navbar />
      {/* Sidebar */}
      <div className="w-full mx-auto px-6 sm:px-6 lg:px-8 py-8 flex gap-6">
        {/* Sidebar - Create Post */}
        <div className="flex-1 max-w-xs sticky top-32 self-start">
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden">
            <div className="p-4">
              <p className="text-lg font-bold text-gray-800 mb-4">สร้างโพสต์</p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <textarea
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  placeholder="เขียนคำบรรยายภาพ..."
                  className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm"
                  rows={4}
                  required
                />
                <label className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                  Upload Images
                  <input
                    type="file"
                    multiple
                    ref={fileInputRef}
                    onChange={(e) =>
                      e.target.files && setImages(Array.from(e.target.files))
                    }
                    className="hidden"
                  />
                </label>
                {images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {images.map((img, idx) => {
                      const url =
                        typeof img === "string" ? img : URL.createObjectURL(img);
                      return (
                        <div
                          key={idx}
                          className="relative w-full pb-[100%] rounded-md overflow-hidden border border-gray-200 shadow-sm"
                        >
                          <img
                            src={url}
                            alt={`preview-${idx}`}
                            className="absolute top-0 left-0 w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setImages((prev) => prev.filter((_, i) => i !== idx))
                            }
                            className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Select Pets */}
                <div>
                  <label className="font-semibold text-gray-700">เลือกสัตว์เลี้ยง:</label>
                  {pets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 mt-1">
                      {pets.map((pet) => (
                        <label
                          key={pet._id}
                          className={`px-3 py-1 rounded-full border text-center text-xs truncate transition ${selectedPets.includes(pet._id)
                            ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                            : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            } cursor-pointer`}
                        >
                          <input
                            type="checkbox"
                            value={pet._id}
                            checked={selectedPets.includes(pet._id)}
                            onChange={() => handlePetChange(pet._id)}
                            className="hidden"
                          />
                          {pet.name}
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm mt-1">คุณยังไม่มีสัตว์เลี้ยง</p>
                  )}
                </div>

                <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl shadow-md transition mt-2">
                  โพสต์
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        {/* Main Feed */}
<div className="flex-1 max-w-2xl flex justify-center">
  <div className="w-full max-w-2xl top-32 space-y-6 border-x border-gray-300 px-4">
    {posts.length === 0 ? (
      <p className="p-4 text-center text-gray-500">ยังไม่มีโพสต์</p>
    ) : (
      posts.map((post) => (
        <div
          key={post._id}
          className="relative bg-white rounded-2xl shadow-md p-4 flex flex-col gap-3 border border-gray-200"
        >
          {/* Delete Button */}
          {post.owner === currentUser?._id && (
            <button
              onClick={() => handleDelete(post._id)}
              className="absolute top-3 right-3 text-red-500 hover:text-red-700"
            >
              ลบ
            </button>
          )}

          {/* Username */}
          <p className="font-semibold text-gray-800">{post.ownerUsername}</p>

          {/* Description */}
          <p className="text-gray-700 text-base">{post.PostDesc}</p>

          {/* Images */}
          {post.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {post.images.map((img: string, idx: number) => (
                <img
                  key={idx}
                  src={`http://localhost:3002${img}`}
                  alt={`post-${idx}`}
                  className="w-full h-48 object-cover rounded-xl cursor-pointer"
                  onClick={() => setOpenImage(`http://localhost:3002${img}`)}
                />
              ))}
            </div>
          )}

          {/* Pets */}
          {post.pets.length > 0 && (
            <p className="text-gray-600 text-sm mt-2 text-right">
              ชื่อสัตว์เลี้ยง: {post.pets.map((p: any) => p.name).join(", ")}
            </p>
          )}
        </div>
      ))
    )}

    {/* Lightbox */}
    {openImage && (
      <div
        className="fixed inset-0 bg-white bg-opacity-80 flex items-center justify-center z-50"
        onClick={() => setOpenImage(null)}
      >
        <img
          src={openImage}
          alt="fullscreen"
          className="max-h-[90vh] max-w-[90vw] rounded-lg shadow-lg"
        />
      </div>
    )}
  </div>
</div>


        {/* My Posts */}
        <div className="flex-1 max-w-xs sticky top-32 self-start">
          <p className="text-black font-bold mb-4">โพสต์ของฉัน</p>
          <div className="space-y-4">
            {currentUser ? (
              myPosts.length === 0 ? (
                <p className="text-gray-500">คุณยังไม่มีโพสต์</p>
              ) : (
                myPosts.map((post) => (
                  <div
                    key={post._id}
                    className="relative bg-white rounded-2xl shadow-md p-4 flex flex-col gap-2 border border-gray-200"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="absolute top-3 right-3 text-red-500 hover:text-red-700"
                    >
                      ลบ
                    </button>

                    {/* Pets */}
                    <p className="font-semibold text-gray-800 text-sm">
                      {post.pets.map((p: any) => p.name).join(", ")}
                    </p>

                    {/* Description */}
                    <p className="text-gray-700 text-sm">{post.PostDesc}</p>

                    {/* Image */}
                    {post.images.length > 0 && (
                      <img
                        src={`http://localhost:3002${post.images[0]}`}
                        alt="my-post"
                        className="w-full max-h-[150px] object-cover rounded-xl"
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

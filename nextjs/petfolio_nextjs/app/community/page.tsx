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
    <div className="flex flex-col min-h-screen w-full bg-[#f5f5f5]">
      <Navbar />

      <div className="flex px-48 gap-4 items-start">
        {/* Sidebar */}
        <div className="w-64 px-4 pt-8 sticky top-32 self-start">
          <p className="text-lg font-bold text-gray-800 mb-4">หน้าคอมมูนิตี้</p>

          {/* Create Post */}
          <div className="w-full rounded-2xl shadow-md bg-white border border-gray-200 overflow-hidden">
            <div className="p-4 text-black">
              <form
                onSubmit={handleSubmit}
                encType="multipart/form-data"
                className="flex flex-col gap-6"
              >
                {/* Post Description */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">
                    คำบรรยายภาพ:
                  </label>
                  <textarea
                    value={postDesc}
                    onChange={(e) => setPostDesc(e.target.value)}
                    className="border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none text-sm"
                    placeholder="เขียนคำบรรยายภาพของคุณ..."
                    rows={4}
                    required
                  />
                </div>

                {/* Upload Images */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10c0 1.1.9 2 2 2h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2z"
                        />
                      </svg>
                      Upload Images
                      <input
                        type="file"
                        multiple
                        ref={fileInputRef}
                        onChange={(e) =>
                          e.target.files &&
                          setImages(Array.from(e.target.files))
                        }
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-2 mt-1">
                      {images.map((img, idx) => {
                        const url =
                          typeof img === "string"
                            ? img
                            : URL.createObjectURL(img);
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
                                setImages((prev) =>
                                  prev.filter((_, i) => i !== idx)
                                )
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
                </div>

                {/* Select Pets */}
                <div className="flex flex-col gap-2">
                  <label className="font-semibold text-gray-700">
                    เลือกสัตว์เลี้ยง:
                  </label>
                  {pets.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 max-h-[5.5rem] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300">
                      {pets.map((pet) => (
                        <label
                          key={pet._id}
                          className={`px-3 py-1 rounded-full border text-center text-xs truncate transition ${
                            selectedPets.includes(pet._id)
                              ? "bg-blue-500 text-white border-blue-500 shadow-sm"
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
                    <p className="text-gray-400 text-sm">คุณยังไม่มีสัตว์เลี้ยง</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition shadow-md"
                >
                  โพสต์
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Main Feed */}
        <div className="pt-20 flex-1 flex flex-col space-y-4 border-l border-r border-gray-300 min-h-screen">
          <div className="w-full space-y-4">
            {posts.length === 0 ? (
              <p className="p-4 text-center text-gray-500">ยังไม่มีโพสต์</p>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className="relative border-gray-300 border-b py-4 space-y-3"
                >
                  {/* Delete Button */}
                  {post.owner === currentUser?._id && (
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ลบ
                    </button>
                  )}

                  <p className="font-bold text-lg pl-4 text-black">
                    {post.pets.map((p: any) => p.name).join(", ")}
                  </p>
                  <p className="text-gray-800 text-base pl-8">{post.PostDesc}</p>

                  {post.images.length > 0 && (
                    <div className="p-4 flex flex-wrap gap-2">
                      {post.images.map((img: string, idx: number) => (
                        <img
                          key={idx}
                          src={`http://localhost:3002${img}`}
                          alt={`post-${idx}`}
                          className={`cursor-pointer object-cover rounded-xl ${
                            post.images.length === 1
                              ? "w-full h-64"
                              : "w-[49%] h-48"
                          }`}
                          onClick={() =>
                            setOpenImage(`http://localhost:3002${img}`)
                          }
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

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
                    className="relative border border-gray-200 rounded-lg p-3 space-y-2 bg-white"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    >
                      ลบ
                    </button>

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

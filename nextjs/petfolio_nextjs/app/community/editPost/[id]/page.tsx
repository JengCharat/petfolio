"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id;

  const [token, setToken] = useState<string | null>(null);
  const [postDesc, setPostDesc] = useState("");
  const [images, setImages] = useState<(File | string)[]>([]);
  const [selectedPets, setSelectedPets] = useState<string[]>([]);
  const [pets, setPets] = useState<{ _id: string; name: string }[]>([]);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  useEffect(() => {
    if (!token || !postId) return;

    // ดึงข้อมูลโพสต์
    fetch(`http://localhost:3002/api/community-posts/communityposts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (!data) return;
        setPostDesc(data.PostDesc || "");
        setSelectedPets(data.pets?.map((p: any) => p._id) || []);
        setImages(data.images || []);
      })
      .catch(err => console.error("Error fetching post:", err));

    // ดึงสัตว์เลี้ยงผู้ใช้
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    fetch(`http://localhost:3002/api/pets/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setPets(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching pets:", err));
  }, [token, postId]);

  const handlePetChange = (petId: string) => {
    setSelectedPets(prev =>
      prev.includes(petId) ? prev.filter(p => p !== petId) : [...prev, petId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !postId) return;

    const formData = new FormData();
    formData.append("PostDesc", postDesc);
    selectedPets.forEach(petId => formData.append("pets", petId));

    images.forEach(img => {
      if (img instanceof File) {
        // รูปใหม่
        formData.append("images", img);
      } else {
        // รูปเดิม
        formData.append("existingImages", img);
      }
    });

    try {
      const res = await fetch(`http://localhost:3002/api/community-posts/updatePost/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "แก้ไขโพสต์ไม่สำเร็จ");
        return;
      }

      const updatedPost = await res.json();
      console.log("Updated post:", updatedPost);

      router.push("/community");
    } catch (err) {
      console.error("Error updating post:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md text-black">
        <h1 className="text-2xl font-bold mb-6 text-center">แก้ไขโพสต์</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <textarea
            value={postDesc}
            onChange={e => setPostDesc(e.target.value)}
            placeholder="เขียนคำบรรยายภาพ..."
            className="w-full border border-gray-300 rounded-xl p-3 text-black text-sm focus:ring-2 focus:ring-purple-500 focus:outline-none"
            rows={4}
            required
          />

          {/* อัปโหลดรูป */}
          <label className="cursor-pointer text-blue-600 hover:text-blue-700">
            ✚ อัปโหลดรูปภาพ
            <input
              type="file"
              multiple
              ref={fileInputRef}
              onChange={e =>
                e.target.files &&
                setImages([
                  ...images.filter(img => typeof img === "string"), // เก็บรูปเดิม
                  ...Array.from(e.target.files),                    // เพิ่มรูปใหม่
                ])
              }
              className="hidden"
            />
          </label>

          {/* แสดง preview */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-1">
              {images.map((img, idx) => {
                const url = typeof img === "string" ? `http://localhost:3002${img}` : URL.createObjectURL(img);
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
                        setImages(prev => prev.filter((_, i) => i !== idx))
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

          {/* เลือกสัตว์เลี้ยง */}
          <div>
            <label className="font-semibold">เลือกสัตว์เลี้ยง:</label>
            <div className="grid grid-cols-2 gap-2 mt-1 max-h-24 overflow-y-auto">
              {pets.map(pet => (
                <label
                  key={pet._id}
                  className={`px-3 py-1 rounded-full border text-xs text-center cursor-pointer ${
                    selectedPets.includes(pet._id)
                      ? "bg-purple-600 text-white border-purple-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  }`}
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
          </div>

          <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-xl font-medium">
            บันทึกการแก้ไข
          </button>
        </form>
      </div>
    </div>
  );
}



"use client";

import { useState } from "react";
import Link from "next/link";

export default function Navbar() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-purple-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* โลโก้ */}
          <div className="flex items-center space-x-3">
            <div className="text-3xl">🐾</div>
            <div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                PetCare
              </span>
              <span className="text-sm text-gray-500 block -mt-1">Pro</span>
            </div>
          </div>

          {/* เมนู */}
          <div className="flex items-center space-x-6">
            <Link
              href="/dashboard"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              หน้าหลัก
            </Link>
            <Link
              href="/pets"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              สัตว์เลี้ยง
            </Link>
            <Link
              href="/health"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              สุขภาพ
            </Link>
            <Link
              href="/calendar"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              ปฏิทิน
            </Link>
            <Link
              href="/community"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              คอมมูนิตี้
            </Link>
            <Link
              href="/explore"
              className="text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              สำรวจ
            </Link>

            {/* แจ้งเตือน */}
            <Link
              href="/reminders"
              className="relative text-gray-700 hover:text-purple-600 font-medium transition-colors"
            >
              แจ้งเตือน
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                5
              </span>
            </Link>

            {/* โปรไฟล์ */}
            <div className="relative">
              <button
                onClick={toggleProfileMenu}
                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  U
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    โปรไฟล์
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50"
                  >
                    การตั้งค่า
                  </Link>
                  <hr className="my-2" />
                  <button className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50">
                    ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

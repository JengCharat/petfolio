"use client";

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { jwtDecode } from "jwt-decode";
interface JWTData {
  id: string;
  email: string;
  iat: number;
  exp: number;
}


export default function First_page() {
  const [userEmail, setUserEmail] = useState("");
  //
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
      return (
        <>
          <Navbar />
          {userEmail && (
            <p className="mb-2 text-green-600">Logged in as: {userEmail}</p>
          )}
        </>
      );
}



    



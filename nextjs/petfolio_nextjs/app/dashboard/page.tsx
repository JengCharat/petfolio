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

interface Student {
  _id: string;
  studentID: string;
  studentName: string;
  email?: string;
  deptNo?: string;
}

export default function First_page() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

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

    // Fetch student list
    fetch("http://localhost:3002/students")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Student[]) => {
        setStudents(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <>
      <Navbar />
      {userEmail && (
        <p className="mb-2 text-green-600">Logged in as: {userEmail}</p>
      )}
      <h1 className="text-red-600 text-2xl mb-4">Student List</h1>
      <ul className="list-disc pl-5">
        {students.map((student) => (
          <li key={student._id}>
            {student.studentID} - {student.studentName} ({student.email}) - Dept:{" "}
            {student.deptNo}
          </li>
        ))}
      </ul>
    </>
  );
}

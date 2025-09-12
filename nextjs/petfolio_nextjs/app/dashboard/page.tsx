
"use client"; // ถ้า Next.js 13 app directory ใช้ client component

import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
export default function First_page() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data จาก Express API
    fetch("http://localhost:3002/students")
      .then((res) => res.json())
      .then((data) => {
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

"use client"
import { useState } from "react";

export default function Register() {
  const [username, setUsername] = useState(""); // เพิ่ม username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

const handleRegister = async () => {
    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
    }

    try {
        const res = await fetch("http://localhost:3002/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password }),
        });

        const data = await res.json();
        if (res.ok) {
            alert("Register successful! Your userId: " + data.userId);
            localStorage.setItem("userId", data.userId); // เก็บ userId ไว้ frontend
            setUsername("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");
        } else {
            alert(data.error || "Register failed");
        }
    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    }
};


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Register</h1>
      <input
        className="border p-2 mb-2 w-64"
        placeholder="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-64"
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className="border p-2 mb-2 w-64"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <input
        className="border p-2 mb-4 w-64"
        placeholder="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      <button
        className="bg-blue-500 text-white p-2 rounded w-64"
        onClick={handleRegister}
      >
        Register
      </button>
    </div>
  );
}

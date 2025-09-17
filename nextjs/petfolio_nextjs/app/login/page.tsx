"use client"
import { useState } from "react";
import Navbar from "../components/Navbar"
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await fetch("http://localhost:3002/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.token) {
      localStorage.setItem("token", data.token);
      alert("Login success");
    } else {
      alert(data.error);
    }
  };

  return (

    <div className="flex flex-col  min-h-screen  bg-[#f5f5f5]">
      <Navbar/>
      <input className="text-black border m-4" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input className="text-black border m-4" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button className="text-black border m-4" onClick={handleLogin}>Login</button>
    </div>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  exp: number;
}

export default function Admin() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const decoded = jwtDecode<TokenPayload>(token);

      if (decoded.role !== "admin") {
        router.push("/403"); 
        return;
      }

      if (decoded.exp * 1000 < Date.now()) {
        localStorage.removeItem("token");
        router.push("/login");
      }

    } catch (err) {
      console.error("Invalid token", err);
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <h1>This is admin page</h1>
    </>
  );
}

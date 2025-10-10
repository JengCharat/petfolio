"use client";
import { useEffect,useState } from "react";
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  exp: number;
}

interface User {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  password: string;
  createdAt: string; 
  updatedAt: string; 
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






    ////////////////////////////////////////////////////////////////////////
    const [AllUser,SetAllUser] = useState<User[]>([]); 
        useEffect(() => {
            const fetchAllUser = async () => {
              try {
                const response = await fetch('http://localhost:3002/users/all_user');
                if (!response.ok) {
                  throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data: User[] = await response.json();
                SetAllUser(data);
              } catch (err) {
                console.error(err);
              }
            };

            fetchAllUser(); 
          }, []); 
////////////////////////////////////////////////////////////////////////////
  return (
    <>
      <h1>This is admin page</h1>
      <ul>
        {AllUser.map(user => (
          <li key={user._id}>
            <strong>{user.username}</strong> ({user.email}) - Role: {user.role} - Created At: {new Date(user.createdAt).toLocaleString()}
          </li>
        ))}
      </ul>

    </>
  );
}

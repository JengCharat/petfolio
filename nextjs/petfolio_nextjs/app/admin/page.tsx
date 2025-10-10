"use client";
import { useEffect,useState } from "react";
import { useRouter } from 'next/navigation';
import { jwtDecode } from "jwt-decode";
////////////////////////////////////////////////////////////
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend);

/////////////////////////////////////////////////////////
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

    const [selectedYear, SetSelectedYear] = useState<number>(new Date().getFullYear());
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



            const years = Array.from(new Set(AllUser.map(u => new Date(u.createdAt).getFullYear()))).sort();
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

            const user_register_data = {
              labels: months,
              datasets: [
                {
                  label: `Users in ${selectedYear}`,
                  data: months.map((m, i) => {
                    return AllUser.filter(user => {
                      const date = new Date(user.createdAt);
                      return date.getFullYear() === selectedYear && date.getMonth() === i;
                    }).length;
                  }),
                  fill: true,
                  backgroundColor: "rgba(75,192,192,0.2)",
                  borderColor: "rgba(75,192,192,1)"
                }
              ]
            };
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
            <label>
                    Select Year:{" "}
                    <select value={selectedYear} onChange={e => SetSelectedYear(Number(e.target.value))}>
                      {years.map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                  </label>

                  <Line data={user_register_data} />

    </>
  );
}

"use client";

import { useEffect, useState } from "react";

interface User {
  id: string;
  role: string;
  name?: string;
}

export default function UserHomePage() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include", // 🔑 gửi cookie kèm request
        });
        if (res.ok) {
          const data: User = await res.json();
          setUser(data);
        } else {
          console.error("Unauthorized:", await res.json());
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };
    fetchUser();
  }, []);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md text-center space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        Xin chào {user?.name || user?.id || "User"} 👋
      </h2>
      <p className="text-gray-700">
        Chào mừng bạn đến với trang chủ {user?.role === "admin" ? "Admin" : "Người dùng"}.
      </p>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { handleLogout } from "@/utils/auth";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<{ name?: string; email?: string; avatar?: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (err) {
        console.error("Fetch user error:", err);
      }
    };
    fetchUser();
  }, []);

  const avatarSrc = user?.avatar || "/default-avatar.png";

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white text-gray-800 py-3 px-6 flex justify-between items-center shadow-sm">
        <h1 className="text-lg font-bold">My E‑Commerce</h1>

        <div className="flex items-center space-x-6">
          <a href="/cart" className="relative text-gray-700 hover:text-gray-900">
            <ShoppingCartIcon className="h-6 w-6" />
            <span className="absolute -top-2 -right-2 bg-red-500 text-xs rounded-full px-1 text-white">3</span>
          </a>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="focus:outline-none"
          >
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-8 w-8 rounded-full border border-gray-300"
            />
          </button>
        </div>
      </header>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed right-4 top-[58px] z-50 w-56 rounded-md border border-gray-300 
                        bg-white shadow-xl">
          <div className="px-3 py-2 flex flex-col text-sm border-b border-gray-200">
            <span className="truncate font-medium text-gray-900">{user?.name || "User"}</span>
            <span className="truncate text-xs text-gray-600">{user?.email || ""}</span>
          </div>

          <ul className="text-sm text-gray-800">
            <li className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
              <Cog6ToothIcon className="h-4 w-4 text-gray-500" />
              Account settings
            </li>
            <li className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer">
              <UserCircleIcon className="h-4 w-4 text-gray-500" />
              Profile
            </li>
            <li
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 cursor-pointer text-red-600 border-t border-gray-200"
            >
              <ArrowRightOnRectangleIcon className="h-4 w-4" />
              Logout
            </li>
          </ul>
        </div>
      )}

      <main className="flex-1 p-6">{children}</main>

      <footer className="bg-gray-100 text-gray-600 text-center py-3 text-sm border-t">
        © 2026 My E‑Commerce. All rights reserved.
      </footer>
    </div>
  );
}

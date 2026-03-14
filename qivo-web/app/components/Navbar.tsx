"use client";

import Link from "next/link";
import { useState } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../lib/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  return (
    <nav
      className={`fixed w-full z-50 backdrop-blur-xl py-4 px-6 flex justify-between items-center
      ${darkMode ? "bg-black/70 border-b border-white/20" : "bg-white/70 border-b border-black/20"}`}
    >
      <Link href="/" className="text-2xl font-extrabold tracking-wider">
        QIVO
      </Link>

      <div className="hidden md:flex gap-10 text-gray-400">
        <Link href="/services" className="hover:text-white transition">
          Services
        </Link>
        <Link href="/bookings" className="hover:text-white transition">
          Bookings
        </Link>
        <Link href="/about" className="hover:text-white transition">
          About
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200/20 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {user ? (
          <>
            <Link
              href="/dashboard"
              className={`${
                darkMode ? "bg-white text-black" : "bg-black text-white"
              } px-5 py-2 rounded-xl hover:opacity-90 transition`}
            >
              Dashboard
            </Link>

            <button
              onClick={logout}
              className="px-5 py-2 rounded-xl border border-white/30 hover:bg-white/10 transition"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              href="/subscribe"
              className="px-5 py-2 rounded-xl border border-white/30 hover:bg-white/10 transition"
            >
              Subscribe
            </Link>

            <Link
              href="/login"
              className={`${
                darkMode ? "bg-white text-black" : "bg-black text-white"
              } px-5 py-2 rounded-xl hover:opacity-90 transition`}
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
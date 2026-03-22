"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Sun, Moon, MessageSquare } from "lucide-react";
import { useAuth } from "../lib/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = useState(true);

  
  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  const bgClass = darkMode
    ? "bg-black/70 border-b border-white/20"
    : "bg-white/70 border-b border-black/20";

  const linkHover = darkMode ? "hover:text-blue-400" : "hover:text-purple-600";

  return (
    <nav
      className={`fixed w-full z-50 backdrop-blur-xl py-4 px-6 flex justify-between items-center transition-colors duration-500 ${bgClass}`}
    >
      {/* Logo / Home */}
      <Link href="/" className="text-2xl font-extrabold tracking-wider">
        QIVO
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex gap-8 text-gray-400 font-medium">
        <Link href="/" className={linkHover}>
          Home
        </Link>
        <Link href="/services" className={linkHover}>
          Services
        </Link>
        <Link href="/bookings" className={linkHover}>
          Bookings
        </Link>
        <Link href="/about" className={linkHover}>
          About
        </Link>
        <Link href="/chat" className={`${linkHover} flex items-center gap-1`}>
          <MessageSquare size={18} /> Chat
        </Link>
      </div>

      {/* Right Buttons */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-full hover:bg-gray-200/20 transition"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Auth Buttons */}
        {user ? (
          <>
            <Link
              href="/dashboard"
              className={`px-5 py-2 rounded-xl font-medium ${
                darkMode ? "bg-white text-black" : "bg-black text-white"
              } hover:opacity-90 transition`}
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
              className={`px-5 py-2 rounded-xl font-medium ${
                darkMode ? "bg-white text-black" : "bg-black text-white"
              } hover:opacity-90 transition`}
            >
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
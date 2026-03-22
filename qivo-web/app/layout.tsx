"use client";
import { ReactNode, useState, useEffect, createContext, useContext } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import { AuthProvider } from "@/app/lib/useAuth";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Dark Mode Context
const DarkModeContext = createContext({
  darkMode: true,
  toggleDarkMode: () => {}
});
export function useDarkMode() {
  return useContext(DarkModeContext);
}

export default function RootLayout({ children }: { children: ReactNode }) {
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("darkMode");
    if (saved) setDarkMode(saved === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  return (
    <html lang="en">
      <body
        className={`transition-colors duration-500 ${
          darkMode ? "bg-black text-white" : "bg-white text-black"
        } ${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <DarkModeContext.Provider
          value={{
            darkMode,
            toggleDarkMode: () => setDarkMode(!darkMode)
          }}
        >
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </DarkModeContext.Provider>
      </body>
    </html>
  );
}
"use client";

import { useState, useEffect, useMemo } from "react";
import { Search } from "lucide-react";
import ServiceCard from "../components/ServiceCard";

type Service = {
  id: number | string;
  name: string;
  description?: string;
  price?: number | string;
  currency?: string;
  avg_rating?: number;
  image_url?: string;
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) setDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await fetch(`${API_URL}/services`);
        const data = await res.json();
        if (data.success) {
          setServices(data.data.services || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const bg = darkMode ? "bg-black text-white" : "bg-white text-black";

  return (
    <main className={`${bg} transition-colors duration-500 min-h-screen px-6 py-24`}>
      <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold">All Services</h1>
        <div className="relative w-full md:w-1/3">
          <input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/10 border border-white/20 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-80 rounded-2xl bg-gradient-to-r from-gray-700/40 via-gray-600/40 to-gray-700/40"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              darkMode={darkMode}
            />
          ))}
        </div>
      )}
    </main>
  );
}
"use client";

import { useState, useEffect } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
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
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [page, setPage] = useState(1);

  const bg = darkMode ? "bg-black text-white" : "bg-white text-black";

  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) setDarkMode(savedMode === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode.toString());
  }, [darkMode]);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          search,
          sort,
          page: String(page),
          limit: "12"
        });

        const res = await fetch(`${API_URL}/services?${params}`);
        const data = await res.json();
        if (data.success) setServices(data.data.services || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [search, sort, page]);

  return (
    <main className={`${bg} transition-colors duration-500 min-h-screen px-6 py-24`}>
      <div className="flex flex-col gap-6 mb-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl md:text-5xl font-bold">Explore Services</h1>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-white/10 border border-white/20 rounded-xl px-4 py-2"
          >
            <option value="featured">Featured</option>
            <option value="rating">Top Rated</option>
            <option value="price_low">Price: Low → High</option>
            <option value="price_high">Price: High → Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1">
            <input
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 outline-none placeholder-gray-400 focus:ring-2 focus:ring-blue-400"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <button className="px-4 rounded-xl bg-white/10 border border-white/20 flex items-center gap-2">
            <SlidersHorizontal size={18} />
            Filters
          </button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-80 rounded-2xl bg-gradient-to-r from-gray-700/40 via-gray-600/40 to-gray-700/40" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} darkMode={darkMode} />
            ))}
          </div>

          <div className="flex justify-center mt-12 gap-4">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 rounded-xl bg-white/10 border border-white/20"
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
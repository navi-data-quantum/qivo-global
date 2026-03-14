"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, DollarSign, CalendarDays, User } from "lucide-react";
import { getServiceById } from "@/services/api";

type Service = {
  id: number | string;
  name: string;
  description?: string;
  price?: number;
  currency?: string;
  avg_rating?: number;
  image_url?: string;
};

export default function ServicePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await getServiceById(id);
        setService(data);
      } catch (err) {
        console.error("Error loading service", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchService();
  }, [id]);

  if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading service...</div>;

  if (!service) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl">Service not found</h2>
        <Link href="/" className="underline">Go back</Link>
      </div>
    );
  }

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-10">
        <Link href="/" className="text-gray-400 hover:text-white">← Back</Link>
        <h1 className="text-4xl font-bold mt-4 mb-6">{service.name}</h1>
        <div className="flex items-center gap-6 text-gray-400 mb-8">
          <div className="flex items-center gap-1 text-yellow-400">
            <Star size={18} fill="currentColor" /> {service.avg_rating ?? 0}
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={18} /> {service.price ?? 0} {service.currency ?? "USD"}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 mb-10">
        <div className="relative w-full h-[420px] rounded-3xl overflow-hidden">
          <Image
            src={service.image_url || `https://source.unsplash.com/1200x800/?${encodeURIComponent(service.name)}`}
            alt={service.name}
            fill
            className="object-cover"
          />
        </div>
      </div>

      <section className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 pb-20">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-4">About this service</h2>
          <p className="text-gray-400 leading-relaxed">{service.description || "This is a professional service offered by experienced providers. Enjoy a premium experience with high quality standards."}</p>
        </div>

        <div className="bg-black/70 border border-white/20 rounded-3xl p-6 h-fit">
          <h3 className="text-xl font-semibold mb-4">Book this service</h3>
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={18} /><span>{service.price ?? 0} {service.currency ?? "USD"}</span>
          </div>
          <div className="flex items-center gap-2 mb-5">
            <CalendarDays size={18} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent border border-white/20 rounded-lg px-3 py-2 outline-none"
            />
          </div>
          <button className="w-full bg-white text-black py-3 rounded-xl font-semibold hover:opacity-90 transition">Confirm Booking</button>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold mb-8">Customer Reviews</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[1,2].map((r) => (
            <div key={r} className="bg-black/70 border border-white/20 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-3"><User size={18} /><span className="font-semibold">User {r}</span></div>
              <div className="flex gap-1 text-yellow-400 mb-2">
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} fill="currentColor" />
                <Star size={16} />
              </div>
              <p className="text-gray-400 text-sm">Amazing experience. Highly recommended service.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
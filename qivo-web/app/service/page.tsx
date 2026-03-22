"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Star,
  Clock,
  BadgeCheck,
  CalendarDays,
  MessageCircle
} from "lucide-react";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export default function Page({ params }: { params: { id: string } }) {
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await fetch(`${API_URL}/services/${params.id}`);
        const data = await res.json();
        if (data.success) setService(data.data);
      } finally {
        setLoading(false);
      }
    };
    fetchService();
  }, [params.id]);

  if (loading)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading...
      </div>
    );

  if (!service)
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Service not found
      </div>
    );

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative h-[420px] rounded-2xl overflow-hidden">
            <Image
              src={service.image_url}
              alt={service.name}
              fill
              className="object-cover"
            />
          </div>

          <div className="space-y-8">
            <h1 className="text-4xl font-bold">{service.name}</h1>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2 text-yellow-400">
                <Star size={18} />
                <span className="font-semibold">{service.avg_rating}</span>
                <span className="text-gray-400">
                  ({service.total_reviews} reviews)
                </span>
              </div>

              {service.badge && (
                <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full">
                  <BadgeCheck size={16} />
                  <span className="text-sm">{service.badge}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-gray-400">
                <Clock size={18} />
                <span>{service.duration_minutes} minutes</span>
              </div>
            </div>

            <p className="text-gray-300 leading-relaxed">
              {service.description}
            </p>

            <div className="text-3xl font-bold">
              {service.price} {service.currency}
            </div>

            <div className="flex gap-4">
              <button className="flex-1 flex items-center justify-center gap-2 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 transition font-semibold">
                <CalendarDays size={20} />
                Book Now
              </button>

              <button className="flex items-center justify-center gap-2 px-6 rounded-xl border border-white/20 hover:bg-white/10 transition">
                <MessageCircle size={20} />
                Contact
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
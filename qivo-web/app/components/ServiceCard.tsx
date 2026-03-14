"use client";

import Image from "next/image";
import Link from "next/link";
import { DollarSign, Star } from "lucide-react";

type Service = {
  id: number | string;
  name: string;
  description?: string;
  price?: number | string;
  currency?: string;
  avg_rating?: number;
  image_url?: string;
};

type Props = {
  service: Service;
  darkMode: boolean;
};

export default function ServiceCard({ service, darkMode }: Props) {
  const cardStyle = darkMode
    ? "bg-black/60 border border-white/20"
    : "bg-white border border-black/10";

  return (
    <div className={`${cardStyle} rounded-2xl overflow-hidden shadow-xl hover:scale-105 transition`}>
      <div className="relative h-56 overflow-hidden">
        <Image
          src={service.image_url || "/placeholder.png"}
          alt={service.name}
          fill
          className="object-cover hover:scale-110 transition duration-500"
        />
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
        <p className="text-gray-400 mb-4">{service.description || "Professional Service"}</p>
        <div className="flex justify-between mb-4">
          <div className="flex items-center gap-1">
            <DollarSign size={16} />
            {service.price ?? 0} {service.currency ?? "USD"}
          </div>
          <div className="flex items-center gap-1">
            <Star size={16} />
            {service.avg_rating ?? 0}
          </div>
        </div>
        <Link
          href={`/service/${service.id}`}
          className={`${darkMode ? "bg-white text-black" : "bg-black text-white"} w-full py-3 rounded-xl text-center block`}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
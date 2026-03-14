"use client";

import { useAuth } from "../lib/useAuth";
import {
  Mail,
  MapPin,
  Star,
  Globe,
  Accessibility,
  User
} from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Please login first
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white flex justify-center p-10">

      <div className="w-full max-w-3xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">

        {/* header */}
        <div className="flex items-center gap-6 mb-8">

          <img
            src={user.profile_image || "/avatar.png"}
            className="w-24 h-24 rounded-full border border-white/20"
          />

          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <User size={26}/> {user.name || "User"}
            </h1>

            <p className="text-gray-400">{user.bio || "No bio yet"}</p>
          </div>

        </div>

        {/* info grid */}
        <div className="grid md:grid-cols-2 gap-6">

          <div className="bg-black/40 p-5 rounded-xl flex items-center gap-3">
            <Mail className="text-blue-400"/>
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p>{user.email}</p>
            </div>
          </div>

          <div className="bg-black/40 p-5 rounded-xl flex items-center gap-3">
            <MapPin className="text-green-400"/>
            <div>
              <p className="text-sm text-gray-400">Location</p>
              <p>{user.city || "Unknown"}, {user.country || ""}</p>
            </div>
          </div>

          <div className="bg-black/40 p-5 rounded-xl flex items-center gap-3">
            <Star className="text-yellow-400"/>
            <div>
              <p className="text-sm text-gray-400">Rating</p>
              <p>{user.average_rating}</p>
            </div>
          </div>

          <div className="bg-black/40 p-5 rounded-xl flex items-center gap-3">
            <Globe className="text-purple-400"/>
            <div>
              <p className="text-sm text-gray-400">Language</p>
              <p>{user.language}</p>
            </div>
          </div>

          <div className="bg-black/40 p-5 rounded-xl flex items-center gap-3">
            <Accessibility className="text-pink-400"/>
            <div>
              <p className="text-sm text-gray-400">Accessibility</p>
              <p>{user.accessibility_mode ? "Enabled" : "Disabled"}</p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
"use client";

import { useState } from "react";
import { Mail, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import Lottie from "lottie-react";
import Link from "next/link";
import forgotAnimation from "@/public/animations/forgot-animation.json";

export default function ForgotPasswordForm() {

  const router = useRouter();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {

      const res = await fetch("http://localhost:5000/api/v1/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to send reset link");
      } else {
        setMessage("Reset link sent to your email");
      }

    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }

  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black text-white">

      <div className="hidden lg:flex w-1/2 items-center justify-center border-r border-zinc-800">

        <div className="max-w-lg px-10 text-center">

          <h1 className="text-6xl font-extrabold mb-6 bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            QIVO
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed">
            Recover your account securely and continue your journey.
          </p>

          <div className="mt-10 text-sm text-zinc-500">
            Secure account recovery
          </div>

          <div className="mt-12 flex justify-center">

            <div className="w-80 opacity-90 hover:opacity-100 transition duration-500 drop-shadow-2xl">

              <Lottie
                animationData={forgotAnimation}
                loop
                className="w-full h-full"
              />

            </div>

          </div>

        </div>

      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">

        <div className="w-full max-w-md p-10 rounded-3xl bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 shadow-2xl">

          <div className="text-center mb-8">

            <h2 className="text-3xl font-bold">
              Forgot Password
            </h2>

            <p className="text-zinc-400 text-sm mt-2">
              Enter your email to receive a reset link
            </p>

          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error}
            </p>
          )}

          {message && (
            <p className="text-green-500 text-sm text-center mb-4">
              {message}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="relative group">

              <Mail
                className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-white transition"
                size={20}
              />

              <input
                type="email"
                placeholder="Email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 p-3 bg-black/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-white transition"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold bg-white text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
            >

              {loading ? "Sending..." : (
                <>
                  <Send size={18}/>
                  Send Reset Link
                </>
              )}

            </button>

          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">

            Remember your password?

            <Link
              href="/login"
              className="text-white ml-1 font-medium hover:underline"
            >
              Back to login
            </Link>

          </p>

        </div>

      </div>

    </div>
  );
}
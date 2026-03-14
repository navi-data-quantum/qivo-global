"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Lottie from "lottie-react";
import resetAnimation from "@/public/animations/password-reset.json";

export default function ResetPasswordForm() {

  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/v1/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Reset failed");
      } else {
        router.push("/login");
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

          <h1 className="text-6xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
            QIVO
          </h1>

          <p className="text-zinc-400 text-lg">
            Create a strong password to secure your account.
          </p>

          <div className="mt-12 flex justify-center">

            <div className="w-80 drop-shadow-2xl">

              <Lottie
                animationData={resetAnimation}
                loop
              />

            </div>

          </div>

        </div>

      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">

        <div className="w-full max-w-md p-10 rounded-3xl bg-zinc-900/70 backdrop-blur-2xl border border-zinc-800 shadow-2xl">

          <div className="flex justify-center mb-6">
            <div className="bg-white/10 p-3 rounded-full">
              <ShieldCheck size={28}/>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-8">
            Reset Password
          </h2>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            <div className="relative group">

              <Lock className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-white transition" size={20} />

              <input
                type={show ? "text" : "password"}
                placeholder="New Password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 p-3 bg-black/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-white transition"
              />

              <button
                type="button"
                onClick={() => setShow(!show)}
                className="absolute right-3 top-3.5 text-zinc-500 hover:text-white transition"
              >
                {show ? <EyeOff size={18}/> : <Eye size={18}/>}
              </button>

            </div>

            <div className="relative group">

              <Lock className="absolute left-3 top-3.5 text-zinc-500 group-focus-within:text-white transition" size={20} />

              <input
                type="password"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 p-3 bg-black/50 border border-zinc-700 rounded-xl focus:outline-none focus:border-white transition"
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold bg-white text-black hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>

          </form>

        </div>

      </div>

    </div>
  );
}
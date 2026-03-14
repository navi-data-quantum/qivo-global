"use client";

import { useState } from "react";
import { Mail, Lock, LogIn, Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Lottie from "lottie-react";
import Link from "next/link";
import { auth, googleProvider, facebookProvider } from "@/app/lib/firebase";
import { 
  signInWithPopup,
  signInWithEmailAndPassword 
} from "firebase/auth";
import loginAnimation from "@/public/animations/login-animation.json";

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    localStorage.removeItem("token");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      if (!userCredential.user) throw new Error("Login failed");

      const token = await userCredential.user.getIdToken();
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("EMAIL LOGIN ERROR:", err);
      if (err.code === "auth/user-not-found") setError("User not found. Please register first.");
      else if (err.code === "auth/wrong-password") setError("Wrong password. Try again.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    localStorage.removeItem("token");

    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (!result.user) throw new Error("Google login failed");

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("GOOGLE LOGIN ERROR:", err);
      if (err.code === "auth/popup-closed-by-user") setError("Login popup closed. Try again.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookLogin = async () => {
    setLoading(true);
    setError("");
    localStorage.removeItem("token");

    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (!result.user) throw new Error("Facebook login failed");

      const token = await result.user.getIdToken();
      localStorage.setItem("token", token);

      router.push("/dashboard");
    } catch (err: any) {
      console.error("FACEBOOK LOGIN ERROR:", err);
      if (err.code === "auth/popup-closed-by-user") setError("Login popup closed. Try again.");
      else setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-black">

      <div className="hidden lg:flex w-1/2 items-center justify-center border-r border-zinc-800">
        <div className="max-w-lg px-10 text-center">
          <h1 className="text-5xl font-bold mb-6">QIVO</h1>
          <p className="text-zinc-400 leading-relaxed">
            The global platform to connect services, professionals and opportunities.
            Manage bookings, payments and reputation in one powerful ecosystem.
          </p>
          <div className="mt-10 text-sm text-zinc-500">Trusted by creators worldwide</div>
          <div className="mt-10 flex justify-center">
            <div className="w-80 opacity-90 hover:opacity-100 transition duration-500">
              <Lottie animationData={loginAnimation} loop className="w-full h-full" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex w-full lg:w-1/2 items-center justify-center px-6">
        <div className="w-full max-w-md p-8 rounded-2xl bg-zinc-900/70 backdrop-blur-xl border border-zinc-800 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold">Welcome Back</h2>
            <p className="text-zinc-400 text-sm mt-2">Login to your QIVO account</p>
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center mb-4">{error}</p>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-zinc-500" size={20} />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 p-3 bg-black/60 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 text-zinc-500" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-10 p-3 bg-black/60 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-500 hover:text-white"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-white to-zinc-300 text-black py-3 rounded-lg font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Signing In..." : <><LogIn size={18} /> Sign In</>}
            </button>
          </form>

          <div className="flex justify-center mt-4 text-sm">
            <Link href="/forgot-password" className="text-zinc-400 hover:text-white">Forgot password?</Link>
          </div>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="text-xs text-zinc-500">OR</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-zinc-700 py-3 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"
            >
              <Image src="/google.svg" alt="google" width={18} height={18} />
              Google
            </button>

            <button
              onClick={handleFacebookLogin}
              disabled={loading}
              className="flex items-center justify-center gap-2 border border-zinc-700 py-3 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"
            >
              <Image src="/facebook.svg" alt="facebook" width={18} height={18} />
              Facebook
            </button>
          </div>

          <p className="text-center text-sm text-zinc-400 mt-6">
            Don't have an account?
            <Link href="/register" className="text-white ml-1 font-medium hover:underline">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
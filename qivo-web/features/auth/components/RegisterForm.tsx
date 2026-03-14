"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Lottie from "lottie-react";
import Link from "next/link";
import { auth, googleProvider, facebookProvider } from "@/app/lib/firebase";
import {
createUserWithEmailAndPassword,
signInWithPopup,
updateProfile
} from "firebase/auth";
import loginAnimation from "@/public/animations/login-animation.json";

export default function RegisterForm() {
const router = useRouter();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);
const [error, setError] = useState("");

const handleRegister = async (e: React.FormEvent) => {
e.preventDefault();
setLoading(true);
setError("");
localStorage.removeItem("token");

try {
const userCredential = await createUserWithEmailAndPassword(
auth,
email.trim(),
password.trim()
);

if (!userCredential.user) throw new Error("Registration failed");

await updateProfile(userCredential.user, { displayName: name });

const token = await userCredential.user.getIdToken();
localStorage.setItem("token", token);

router.push("/dashboard");
} catch (err: any) {
if (err.code === "auth/email-already-in-use") setError("Email already registered");
else if (err.code === "auth/invalid-email") setError("Invalid email");
else if (err.code === "auth/weak-password") setError("Weak password");
else setError(err.message);
} finally {
setLoading(false);
}
};

const handleGoogleRegister = async () => {
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
if (err.code === "auth/popup-closed-by-user") setError("Login popup closed");
else setError(err.message);
} finally {
setLoading(false);
}
};

const handleFacebookRegister = async () => {
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
if (err.code === "auth/popup-closed-by-user") setError("Login popup closed");
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
Join the global platform connecting professionals, services and opportunities.
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
<h2 className="text-3xl font-bold">Create Account</h2>
<p className="text-zinc-400 text-sm mt-2">Start your journey with QIVO</p>
</div>

{error && (

<p className="text-red-500 text-sm text-center mb-4">{error}</p>
)}

<form onSubmit={handleRegister} className="space-y-4">

<div className="relative">
<User className="absolute left-3 top-3 text-zinc-500" size={20} />
<input
type="text"
placeholder="Full Name"
value={name}
onChange={(e) => setName(e.target.value)}
required
className="w-full pl-10 p-3 bg-black/60 border border-zinc-700 rounded-lg focus:outline-none focus:border-white transition"
/>
</div>

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

{loading ? "Creating..." : <><UserPlus size={18} /> Create Account</>} </button>

</form>

<div className="flex items-center gap-3 my-6">
<div className="flex-1 h-px bg-zinc-800" />
<span className="text-xs text-zinc-500">OR</span>
<div className="flex-1 h-px bg-zinc-800" />
</div>

<div className="grid grid-cols-2 gap-3">

<button
onClick={handleGoogleRegister}
disabled={loading}
className="flex items-center justify-center gap-2 border border-zinc-700 py-3 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"

>

<Image src="/google.svg" alt="google" width={18} height={18}/>
Google
</button>

<button
onClick={handleFacebookRegister}
disabled={loading}
className="flex items-center justify-center gap-2 border border-zinc-700 py-3 rounded-lg hover:bg-zinc-800 transition disabled:opacity-60"

>

<Image src="/facebook.svg" alt="facebook" width={18} height={18}/>
Facebook
</button>

</div>

<p className="text-center text-sm text-zinc-400 mt-6">
Already have an account?
<Link href="/login" className="text-white ml-1 font-medium hover:underline">
Sign in
</Link>
</p>

</div>
</div>

</div>
);
}

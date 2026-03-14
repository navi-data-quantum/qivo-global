import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">

      {/* glow background */}
      <div className="absolute w-[600px] h-[600px] bg-purple-600/20 blur-[150px] rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-blue-600/20 blur-[150px] rounded-full bottom-[-200px] right-[-200px]" />

      <LoginForm />

    </div>
  );
}
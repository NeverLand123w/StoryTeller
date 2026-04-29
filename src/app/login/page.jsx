// app/login/page.js
"use client";
import React, { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, AlertCircle, KeyRound } from "lucide-react";

export default function LoginPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/send-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Invalid email or password.");
        setLoading(false);
        return;
      }

      setStep(2);
      setLoading(false);
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        otp,
        redirect: false,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
        return;
      }

      router.replace("/dashboard");
    } catch (err) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
          {step === 1 ? "Welcome back" : "Two-Step Verification"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {step === 1
            ? "Sign in to access your dashboard."
            : `We've sent a code to ${email}`}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/40 border border-zinc-800 py-8 px-6 shadow-xl sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-sm">
              <AlertCircle size={16} />
              <p>{error}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-zinc-400">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                  placeholder="••••••••"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-white text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin"></div>
                ) : (
                  <>
                    Continue
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-6" autoComplete="off">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Authentication Code
                </label>

                {/* Decoy input to absorb browser autofill */}
                <input type="text" name="email" style={{ display: "none" }} />

                <input
                  type="text"
                  name="otp_field_unique_id"
                  value={otp}
                  autoComplete="off"
                  data-lpignore="true"
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setOtp(val);
                  }}
                  maxLength={6}
                  required
                  placeholder="000000"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-lg text-center text-2xl tracking-widest outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-white text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin"></div>
                ) : (
                  <>
                    Verify & Sign In
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setOtp("");
                }}
                className="w-full text-sm text-zinc-400 hover:text-white transition-colors mt-4"
              >
                Cancel and go back
              </button>
            </form>
          )}

          {step === 1 && (
            <div className="mt-8 text-center text-sm text-zinc-400">
              Don't have an account?{" "}
              <Link
                href="/register"
                className="font-medium text-white hover:underline decoration-zinc-500 underline-offset-4"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
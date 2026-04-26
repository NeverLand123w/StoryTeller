"use client";
import React, { useState } from "react";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function ForgotPassword() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setStep(2);
      } else {
        setMessage("Email not recognized in our system.");
      }
    } catch (err) {
      setMessage("Connection error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPass = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        body: JSON.stringify({ email, otp, newPassword: newPass }),
        headers: { "Content-Type": "application/json" },
      });
      if (res.ok) {
        setMessage("Password successfully reset. You may now sign in.");
      } else {
        setMessage("Invalid verification code.");
      }
    } catch (err) {
      setMessage("Reset failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-zinc-800 selection:text-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="text-3xl font-bold text-zinc-100 tracking-tight">
          {step === 1 ? "Forgot password" : "Reset your password"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {step === 1
            ? "Enter your email to receive a recovery code."
            : "Check your inbox. Enter the code and your new password."}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/40 border border-zinc-800 py-8 px-6 shadow-xl sm:rounded-xl sm:px-10">
          
          {message && (
            <div
              className={`mb-6 flex items-center gap-2 p-3 rounded-lg text-sm ${
                message.includes("reset") || message.includes("Recovered")
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                  : "bg-rose-500/10 border border-rose-500/20 text-rose-500"
              }`}
            >
              {message.includes("reset") || message.includes("Recovered") ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              <p>{message}</p>
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={sendOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Email Address
                </label>
                <input
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                />
              </div>

              <button
                disabled={loading}
                className="w-full bg-white text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin"></div>
                    Sending code...
                  </>
                ) : (
                  "Send Recovery Code"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={resetPass} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2 text-center">
                  6-Digit Verification Code
                </label>
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
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-3 rounded-lg outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-700 text-center text-3xl font-bold tracking-[0.5em]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  New Password
                </label>
                <input
                  onChange={(e) => setNewPass(e.target.value)}
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-4 py-2.5 rounded-lg text-sm outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-all placeholder:text-zinc-600"
                />
              </div>

              <div className="space-y-4 pt-2">
                <button
                  disabled={loading}
                  className="w-full bg-white text-zinc-950 font-semibold py-2.5 rounded-lg hover:bg-zinc-200 transition-colors disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-zinc-500 border-t-zinc-950 rounded-full animate-spin"></div>
                      Verifying...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-sm font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowLeft size={16} /> Use a different email
                </button>
              </div>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-zinc-400">
            <Link
              href="/login"
              className="font-medium text-white hover:underline decoration-zinc-500 underline-offset-4"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
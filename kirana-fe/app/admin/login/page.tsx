"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtpAction, verifyOtpAction } from "./actions";

export default function AdminLoginPage() {
  const router = useRouter();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Define the app ID for admin routes. Since there isn't an explicit admin app right now,
  // we'll default to alertpay-web or alertpay-default to allow the login to pass.
  const APP_ID = "alertpay-web"; 

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!phoneNumber) return;
    
    // Auto-prefix Indian country code if not present (assuming Indian numbers based on testing phone 9999999999)
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

    try {
      setLoading(true);
      setError(null);
      
      const result = await sendOtpAction(formattedPhone);

      if (!result.success) {
        throw new Error(result.error || "Failed to send OTP");
      }

      setOtpSent(true);
    } catch (err: any) {
      console.error("OTP request failed", err);
      setError(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp) return;

    // Same formatting logic
    const formattedPhone = phoneNumber.startsWith("+") ? phoneNumber : `+91${phoneNumber}`;

    try {
      setLoading(true);
      setError(null);
      
      const result = await verifyOtpAction(formattedPhone, otp);

      if (!result.success) {
        throw new Error(result.error || "Invalid OTP");
      }

      // Success! Perform client-side navigation for a smoother experience
      router.push("/admin");
      // Note: We don't setLoading(false) here to maintain the loading state during navigation
      
    } catch (err: any) {
      console.error("OTP verification failed", err);
      setError(err.message || "Invalid OTP. Please try again.");
      setLoading(false); // Only stop loading on error
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Admin Login
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in with your phone number to continue.
          </p>
        </div>

        {error ? (
          <p className="mb-4 text-sm font-medium text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        {!otpSent ? (
          <form onSubmit={handleSendOtp} className="space-y-4 text-sm">
            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block font-medium text-zinc-700 dark:text-zinc-300"
              >
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 99999 99999"
                required
                disabled={loading}
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !phoneNumber}
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-zinc-50 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900"
            >
              {loading ? "Sending..." : "Send OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-sm">
            <div className="space-y-2">
              <label
                htmlFor="otp"
                className="block font-medium text-zinc-700 dark:text-zinc-300"
              >
                Enter OTP
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                required
                disabled={loading}
                className="block w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 disabled:opacity-50 dark:border-zinc-800 dark:bg-black dark:text-zinc-50 dark:placeholder-zinc-500 dark:focus:border-zinc-100 dark:focus:ring-zinc-100"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="inline-flex w-full items-center justify-center rounded-lg bg-zinc-900 px-4 py-2.5 font-medium text-zinc-50 transition hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-100 dark:focus-visible:ring-offset-zinc-900"
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setOtp("");
                setError(null);
              }}
              disabled={loading}
              className="w-full text-center text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-50"
            >
              Change phone number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

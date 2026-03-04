"use client";

import Link from "next/link";
import { useState } from "react";
import { authClient } from "@/lib/better-auth/client";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleSignIn() {
    try {
      setError(null);
      
      // Use Better Auth's built-in Google OAuth
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error("Google sign-in failed", err);
      setError("Failed to sign in with Google. Please try again.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 dark:bg-black">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Welcome back
          </h1>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Sign in to continue to Alterpay.
          </p>
        </div>

        {error ? (
          <p className="mb-4 text-sm text-red-500" role="alert">
            {error}
          </p>
        ) : null}

        <div className="mt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-900 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
          >
            Continue with Google
          </button>
        </div>

        <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
          By continuing, you agree to our{" "}
          <Link
            href="#"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-50"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

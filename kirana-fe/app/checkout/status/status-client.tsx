"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

type StatusState = "loading" | "success" | "failed" | "pending";

export function CheckoutStatusClient() {
  const searchParams = useSearchParams();
  const provider = searchParams.get("provider");
  const id = searchParams.get("id"); // Subscription ID

  const [status, setStatus] = useState<StatusState>("loading");
  const [message, setMessage] = useState("Verifying payment status...");

  useEffect(() => {
    const checkStatus = async () => {
      try {
        let endpoint;

        if (provider === "phonepe") {
          const merchantOrderId = searchParams.get("merchantOrderId") || id;
          endpoint = `/api/phonepe?action=status&merchantOrderId=${merchantOrderId}`;

          const res = await fetch(endpoint);
          const data = await res.json();

          if (data.state === "COMPLETED" || data.state === "SUCCESS") {
            setStatus("success");
            setMessage("Payment successful! Your order is confirmed.");
          } else if (data.state === "FAILED" || data.state === "CANCELLED") {
            setStatus("failed");
            setMessage("Payment failed or was cancelled.");
          } else if (data.state === "PENDING" || data.state === "PROCESSING") {
            setStatus("pending");
            setMessage("Payment is processing. Please check back later.");
          } else {
            setStatus("pending");
            setMessage(`Payment status: ${data.state || "Unknown"}`);
          }
        } else if (provider === "razorpay") {
          setStatus("pending");
          setMessage("Razorpay payment verification not implemented yet.");
        } else {
          setStatus("failed");
          setMessage("Unsupported payment provider.");
        }
      } catch (error) {
        console.error("Error checking status:", error);
        setStatus("failed");
        setMessage("Failed to verify payment status.");
      }
    };

    if (id && provider) {
      checkStatus();
    }
  }, [id, provider, searchParams]);

  if (!id || !provider) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <div className="text-red-500 text-5xl mb-4">✗</div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Failed</h1>
          <p className="text-slate-600 mb-6">Invalid payment details.</p>
          <Link
            href="/checkout"
            className="inline-block px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
          >
            Return to Checkout
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
        {status === "loading" && (
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        )}

        {status === "success" && (
          <div className="text-green-500 text-5xl mb-4">✓</div>
        )}

        {status === "failed" && (
          <div className="text-red-500 text-5xl mb-4">✗</div>
        )}

        {status === "pending" && (
          <div className="text-yellow-500 text-5xl mb-4">⏳</div>
        )}

        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          {status === "loading"
            ? "Processing..."
            : status === "success"
            ? "Success!"
            : status === "failed"
            ? "Failed"
            : "Pending"}
        </h1>

        <p className="text-slate-600 mb-6">{message}</p>

        <Link
          href="/checkout"
          className="inline-block px-6 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition"
        >
          Return to Checkout
        </Link>
      </div>
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  image?: string;
  redirect?: boolean;
}

interface RazorpayInstance {
  createPayment: (data: PaymentData) => void;
  on: (event: string, handler: (response: unknown) => void) => void;
  once: (event: string, handler: (response: unknown) => void) => void;
  verifyVpa: (vpa: string) => Promise<{ vpa: string; success: boolean }>;
}

interface PaymentData {
  amount: number;
  currency: string;
  email: string;
  contact: string;
  order_id: string;
  method: string;
  [key: string]: unknown;
}

interface PaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

interface PaymentErrorResponse {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
    metadata: {
      payment_id: string;
      order_id: string;
    };
  };
}

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [razorpayInstance, setRazorpayInstance] =
    useState<RazorpayInstance | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [paymentResponse, setPaymentResponse] = useState<
    PaymentSuccessResponse | PaymentErrorResponse | null
  >(null);
  const [paymentMethods, setPaymentMethods] = useState<Record<
    string,
    unknown
  > | null>(null);
  const [vpaVerified, setVpaVerified] = useState<boolean | null>(null);
  const [verifyingVpa, setVerifyingVpa] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    amount: 100, // Amount in rupees (will be converted to paise)
    upiId: "",
    isRecurring: false,
    provider: "razorpay" as "razorpay" | "phonepe",
  });

  // Initialize Razorpay instance when script loads
  useEffect(() => {
    if (scriptLoaded && window.Razorpay) {
      const instance = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        image: "/logo.png", // Update with your logo
      });

      // Fetch available payment methods
      instance.once("ready", (response: unknown) => {
        const readyResponse = response as { methods: Record<string, unknown> };
        console.log("Available payment methods:", readyResponse.methods);
        setPaymentMethods(readyResponse.methods);
      });

      // Set up event handlers
      instance.on("payment.success", async (response: unknown) => {
        const successResponse = response as PaymentSuccessResponse;

        // Verify payment signature
        try {
          const verifyRes = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpay_order_id: successResponse.razorpay_order_id,
              razorpay_payment_id: successResponse.razorpay_payment_id,
              razorpay_signature: successResponse.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();

          if (verifyData.verified) {
            setPaymentStatus("success");
            setPaymentResponse(successResponse);
          } else {
            setPaymentStatus("error");
            setPaymentResponse({
              error: {
                code: "SIGNATURE_VERIFICATION_FAILED",
                description: "Payment signature verification failed",
                source: "server",
                step: "verification",
                reason: "invalid_signature",
                metadata: {
                  payment_id: successResponse.razorpay_payment_id,
                  order_id: successResponse.razorpay_order_id,
                },
              },
            });
          }
        } catch {
          setPaymentStatus("error");
          setPaymentResponse({
            error: {
              code: "VERIFICATION_ERROR",
              description: "Failed to verify payment",
              source: "server",
              step: "verification",
              reason: "server_error",
              metadata: {
                payment_id: successResponse.razorpay_payment_id,
                order_id: successResponse.razorpay_order_id,
              },
            },
          });
        }
        setLoading(false);
      });

      instance.on("payment.error", (response: unknown) => {
        setPaymentStatus("error");
        setPaymentResponse(response as PaymentErrorResponse);
        setLoading(false);
      });

      setRazorpayInstance(instance);
    }
  }, [scriptLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "amount"
          ? Number(value)
          : value,
    }));
    // Reset VPA verification when UPI ID changes
    if (name === "upiId") {
      setVpaVerified(null);
    }
  };

  const handleVerifyVpa = async () => {
    if (!razorpayInstance || !formData.upiId) return;

    setVerifyingVpa(true);
    try {
      await razorpayInstance.verifyVpa(formData.upiId);
      setVpaVerified(true);
    } catch {
      setVpaVerified(false);
    } finally {
      setVerifyingVpa(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setPaymentStatus("idle");

     try {
       if (formData.provider === "phonepe") {
           // PhonePe Logic - use initiate-payment for direct checkout
           const response = await fetch("/api/phonepe?action=initiate-payment", {
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify({
                   action: "initiate-payment",
                   amount: formData.amount,
                   redirectUrl: `${window.location.origin}/checkout/status?provider=phonepe`,
                   message: `Payment for ${formData.name}`,
                   metaInfo: {
                       customerName: formData.name,
                       customerEmail: formData.email,
                       customerPhone: formData.contact
                   }
               })
           });

           const data = await response.json();

           if (!response.ok) {
               throw new Error(data.error || "PhonePe initiation failed");
           }

           if (data.redirectUrl) {
               window.location.href = data.redirectUrl;
           } else {
               throw new Error("No redirect URL returned from PhonePe");
           }
      } else {
          // Razorpay Logic (Existing)
          if (!razorpayInstance) return;

          // Step 1: Create order on server
          const orderResponse = await fetch("/api/razorpay/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              amount: formData.amount * 100, // Convert to paise
              currency: "INR",
              receipt: `receipt_${Date.now()}`,
              payment_method: "upi",
              upi: {
                vpa: formData.upiId,
                flow: "collect",
              },
              isRecurring: formData.isRecurring,
              notes: {
                name: formData.name,
                email: formData.email,
                contact: formData.contact,
              },
            }),
          });
    
          if (!orderResponse.ok) {
            const error = await orderResponse.json();
            throw new Error(error.error || "Failed to create order");
          }
    
          const orderData = await orderResponse.json();
    
          console.log("Order data:", orderData);
          console.log("Payment data:", orderData.razorpayOrder);
          razorpayInstance.createPayment(orderData.razorpayOrder);
      }
    } catch (error) {
      setPaymentStatus("error");
      setPaymentResponse({
        error: {
          code: "CLIENT_ERROR",
          description:
            error instanceof Error ? error.message : "Something went wrong",
          source: "client",
          step: "order_creation",
          reason: "order_failed",
          metadata: { payment_id: "", order_id: "" },
        },
      });
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/razorpay.js"
        onLoad={() => setScriptLoaded(true)}
      />

      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
            Checkout
          </h1>

          {paymentStatus === "success" &&
            paymentResponse &&
            "razorpay_payment_id" in paymentResponse && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  Payment Successful!
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Payment ID: {paymentResponse.razorpay_payment_id}
                </p>
              </div>
            )}

          {paymentStatus === "error" &&
            paymentResponse &&
            "error" in paymentResponse && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 font-medium">Payment Failed</p>
                <p className="text-sm text-red-600 mt-1">
                  {paymentResponse.error.description}
                </p>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
                placeholder="+919876543210"
              />
            </div>

            {/* Payment Provider Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Payment Provider
              </label>
              <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                          type="radio" 
                          name="provider" 
                          value="razorpay" 
                          checked={formData.provider === "razorpay"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">Razorpay</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                          type="radio" 
                          name="provider" 
                          value="phonepe" 
                          checked={formData.provider === "phonepe"}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-primary focus:ring-primary"
                      />
                      <span className="text-sm text-slate-700">PhonePe</span>
                  </label>
              </div>
            </div>

            {formData.provider === "razorpay" && (
                <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    UPI ID
                </label>
                <div className="flex gap-2">
                    <input
                    type="text"
                    name="upiId"
                    value={formData.upiId}
                    onChange={handleInputChange}
                    required={formData.provider === "razorpay"}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                        vpaVerified === true
                        ? "border-green-500"
                        : vpaVerified === false
                        ? "border-red-500"
                        : "border-slate-300"
                    }`}
                    placeholder="yourname@upi"
                    />
                    <button
                    type="button"
                    onClick={handleVerifyVpa}
                    disabled={!formData.upiId || verifyingVpa || !scriptLoaded}
                    className="px-4 py-2 bg-slate-600 text-white text-sm font-medium rounded-lg hover:bg-slate-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition"
                    >
                    {verifyingVpa ? "..." : "Verify"}
                    </button>
                </div>
                {vpaVerified === true && (
                    <p className="text-sm text-green-600 mt-1">✓ UPI ID verified</p>
                )}
                {vpaVerified === false && (
                    <p className="text-sm text-red-600 mt-1">✗ Invalid UPI ID</p>
                )}
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                required
                min={1}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isRecurring"
                id="isRecurring"
                checked={formData.isRecurring}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
              />
              <label
                htmlFor="isRecurring"
                className="text-sm font-medium text-slate-700"
              >
                Enable recurring payment (subscription)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || (!scriptLoaded && formData.provider === "razorpay")}
              className="w-full py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 disabled:bg-slate-400 disabled:cursor-not-allowed transition mt-6"
            >
              {loading ? "Processing..." : `Pay via ${formData.provider === "razorpay" ? "Razorpay" : "PhonePe"} - ₹${formData.amount}`}
            </button>
          </form>

           <p className="text-xs text-slate-500 text-center mt-6">
             Secured by Razorpay & PhonePe
           </p>
           
           {/* PhonePe Logo/Brand info */}
           {formData.provider === "phonepe" && (
             <div className="mt-4 flex items-center justify-center gap-2">
               <div className="w-6 h-6 bg-purple-600 rounded-full"></div>
               <span className="text-xs text-slate-600">Powered by PhonePe</span>
             </div>
           )}
        </div>
      </div>
    </>
  );
}

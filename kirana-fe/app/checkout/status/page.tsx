import { Suspense } from "react";
import { CheckoutStatusClient } from "./status-client";

export default function CheckoutStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800 mb-2">Processing...</h1>
            <p className="text-slate-600 mb-6">Verifying payment status...</p>
          </div>
        </div>
      }
    >
      <CheckoutStatusClient />
    </Suspense>
  );
}

"use client";

import Link from "next/link";

export default function AlertSoundboxCancellationPage() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Refund & <span className="text-gradient">Cancellation</span></h1>
            <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Last updated: October 20, 2025</p>
          </div>
          <Link href="/alertpe-soundbox" className="px-6 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all">
            Back to Alert Soundbox
          </Link>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Payments and Authorization</h2>
            <p className="text-lg mb-4">
              All payments made through UPI AutoPay, debit/credit cards, or any other approved payment method are processed only after user authorization.
            </p>
            <p className="text-lg">
              Once a payment is authorized, it will be processed through our secure payment gateway in compliance with RBI and NPCI guidelines.
            </p>
          </section>

          <section className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6">2. Subscription Plans</h2>
            <ul className="space-y-4 text-lg font-semibold text-primary/80">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Monthly Plan: ₹149 - Valid for 30 days
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Quarterly Plan: ₹399 - Valid for 90 days
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Annual Plan: ₹1499 - Valid for 365 days
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Refund Eligibility</h2>
            <p className="text-lg mb-6">Refunds are considered only in specific and verifiable cases:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 bg-white border border-gray-100 premium-shadow rounded-2xl">
                <h4 className="font-bold mb-2">Duplicate Payments</h4>
                <p className="text-sm opacity-80">If technical issues cause double charging for the same service.</p>
              </div>
              <div className="p-6 bg-white border border-gray-100 premium-shadow rounded-2xl">
                <h4 className="font-bold mb-2">Technical Failure</h4>
                <p className="text-sm opacity-80">If payment is deducted but the subscription remains inactive.</p>
              </div>
            </div>
          </section>

          <div className="pt-12 mt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Support Information</h2>
            <div className="bg-gray-900 text-white p-10 rounded-[3rem] space-y-4">
              <p className="text-lg font-bold">Need help with a refund?</p>
              <div className="space-y-1 opacity-70">
                <p><strong>Entity:</strong> LNPK Business Pvt Ltd</p>
                <p><strong>Email:</strong> support@kiranaapps.com</p>
                <p><strong>Phone:</strong> +91 8595404595</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

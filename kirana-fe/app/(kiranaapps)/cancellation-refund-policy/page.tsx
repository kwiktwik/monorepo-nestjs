"use client";

import Link from "next/link";

export default function KiranaAppsCancellation() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Cancellation & <span className="text-gradient">Refund</span></h1>
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Last updated: October 20, 2025</p>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Cancellation Policy</h2>
            <p className="text-lg mb-4">
              You can cancel your subscription at any time through your account settings or by contacting our support team.
            </p>
            <p className="text-lg">
              Once canceled, you will continue to have access to the premium features until the end of your current billing period. No future charges will be made.
            </p>
          </section>

          <section className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6">2. Refund Eligibility</h2>
            <p className="text-lg text-primary/80 mb-6">
              We offer refunds under the following conditions:
            </p>
            <ul className="space-y-4 text-lg font-semibold text-primary">
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Technical issues that prevent service use and cannot be resolved by our team.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Duplicate charges due to system errors.
              </li>
              <li className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Erroneous subscription renewals reported within 7 days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. Non-Refundable Items</h2>
            <p className="text-lg">
              Partially used subscription periods are generally not refundable unless required by local law. One-time setup fees, if any, are non-refundable once the service activation is complete.
            </p>
          </section>

          <div className="pt-12 mt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Processing Time</h2>
            <p className="text-lg">
              Approved refunds are processed within 5-7 business days and will be credited back to the original payment method used during the transaction.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

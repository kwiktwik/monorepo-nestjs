"use client";

import Link from "next/link";
import { useState } from "react";

export default function SoundboxFAQ() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-gray-900">
            Alert Soundbox <span className="text-primary bg-primary/10 px-2 rounded-lg">FAQ</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Everything you need to know about the Alert Soundbox app.
          </p>
        </div>

        {/* Features Section */}
        <div className="mb-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    "Instant UPI payment voice alerts",
                    "Unlimited transaction storage",
                    "9+ Indian language support",
                    "Advanced analytics",
                    "Auto-sync from multiple UPI apps",
                    "Ad-free experience",
                    "Works offline for alerts"
                ].map((feature, index) => (
                    <div key={index} className="flex items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:shadow-sm">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4 flex-shrink-0">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <span className="font-semibold text-gray-700">{feature}</span>
                    </div>
                ))}
            </div>
        </div>

        {/* FAQ Section */}
        <div className="space-y-6">
          <FAQItem
            question="Who is Alert Soundbox for?"
            answer="Alert Soundbox is built for shopkeepers, kirana stores, service providers, and anyone receiving UPI payments who wants instant voice alerts."
          />
           <FAQItem
            question="Is there a free trial?"
            answer="Yes! Try all premium features with full access during the trial period."
          />
          <FAQItem
            question="Is the mandate verification amount refundable?"
            answer="Yes. The mandate verification amount is refunded automatically after verification."
          />
          <FAQItem
            question="Can I cancel my subscription?"
            answer="Yes, you can cancel your subscription anytime during the trial period."
          />
          <FAQItem
            question="Is my business data secure?"
            answer="Absolutely. Your data is private, encrypted, and never shared with third parties."
          />
        </div>

        {/* Contact/Action Section */}
        <div className="pt-16 mt-16 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-medium mb-6">Still have questions?</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/contact" className="px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all">
                  Contact Support
                </Link>
                <Link href="/alertpe-soundbox" className="px-8 py-3 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary/20 transition-all">
                  Get the App
                </Link>
            </div>
        </div>

      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border border-gray-100 rounded-[1.5rem] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-300">
      <summary className="list-none cursor-pointer px-8 py-6 flex justify-between items-center bg-white hover:bg-gray-50 transition-colors select-none">
        <h4 className="text-lg font-bold text-gray-800 pr-4">{question}</h4>
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary transform group-open:rotate-180 transition-transform duration-300 flex-shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </summary>
      <div className="px-8 pb-8 bg-white">
        <p className="text-base text-gray-600 leading-relaxed pt-2">
          {answer}
        </p>
      </div>
    </details>
  );
}

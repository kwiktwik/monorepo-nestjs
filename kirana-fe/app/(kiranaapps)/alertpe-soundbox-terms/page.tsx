"use client";

import Link from "next/link";

export default function AlertSoundboxTermsPage() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 border-b border-gray-100 pb-8">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Terms of <span className="text-gradient">Service</span></h1>
            <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Last updated: October 20, 2025</p>
          </div>
          <Link href="/alertpe-soundbox" className="px-6 py-2.5 text-sm font-bold text-primary bg-primary/10 rounded-xl hover:bg-primary hover:text-white transition-all">
            Back to Alert Soundbox
          </Link>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Acceptance of Terms</h2>
            <p className="text-lg">
              By downloading, installing, or using the Alert Soundbox application developed by <strong>LNPK Business Pvt Ltd</strong>, you agree to be bound by these Terms of Service. If you do not agree, please do not use the application.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. Description of Service</h2>
            <p className="text-lg">
              Alert Soundbox is a digital tool designed to provide voice-based payment notifications for UPI transactions. It acts as a receiver for payment alerts and does not manage or hold any user funds directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">3. User Responsibilities</h2>
            <ul className="space-y-4 list-disc list-inside ml-4 text-lg">
              <li>Users must ensure they have the necessary permissions to receive payment alerts from their respective banking or UPI apps.</li>
              <li>You are responsible for the accuracy of the UPI details linked to the app.</li>
              <li>Unauthorized use of the app for fraudulent activities is strictly prohibited and will lead to immediate account termination.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">4. Intellectual Property</h2>
            <p className="text-lg">
              All content, including software code, logos, designs, and voice alert technology, is the exclusive property of LNPK Business Pvt Ltd. You may not copy, modify, or redistribute any part of the application without prior written consent.
            </p>
          </section>

          <div className="pt-12 mt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Us</h2>
            <div className="bg-primary/10 p-8 rounded-[2rem] space-y-2">
              <p className="font-bold text-primary-dark">LNPK Business Pvt Ltd</p>
              <p className="text-primary/80">Email: support@kiranaapps.com</p>
              <p className="text-primary/80">Phone: +91 8595404595</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

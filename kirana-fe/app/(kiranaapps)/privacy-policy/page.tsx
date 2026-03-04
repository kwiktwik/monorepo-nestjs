"use client";

import Link from "next/link";

export default function KiranaAppsPrivacy() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="mb-12 border-b border-gray-100 pb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2">Privacy <span className="text-gradient">Policy</span></h1>
          <p className="text-sm font-bold text-gray-400 tracking-widest uppercase">Last updated: October 20, 2025</p>
        </div>

        <div className="space-y-12 text-gray-600 leading-relaxed max-w-none">
          <section>
            <p className="text-lg">
              At Kirana Apps, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile applications and services.
            </p>
          </section>

          <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">1. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h4 className="font-bold text-gray-800 mb-2 underline underline-offset-4 decoration-primary/20">Personal Information</h4>
                <p>When you register, we may collect your name, phone number, email address, and business details.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2 underline underline-offset-4 decoration-primary/20">Transaction Information</h4>
                <p>To provide voice alerts, our app processes notification data from your payment apps. This data is processed locally on your device.</p>
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-2 underline underline-offset-4 decoration-primary/20">Device Information</h4>
                <p>We collect device-specific information such as model, OS version, and unique device identifiers for troubleshooting and optimization.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">2. How We Use Your Information</h2>
            <ul className="space-y-4 list-disc list-inside ml-4 text-lg">
              <li>To provide and maintain our services.</li>
              <li>To notify you about changes to our apps.</li>
              <li>To provide customer support and gather feedback.</li>
              <li>To detect, prevent, and address technical issues.</li>
            </ul>
          </section>

          <section className="bg-primary/10 p-10 rounded-[3rem] border border-primary/20">
            <h2 className="text-2xl font-bold text-primary mb-6">3. Data Security</h2>
            <p className="text-lg text-primary">
              We value your trust in providing us your Personal Information. We use commercially acceptable means of protecting it. However, remember that no method of transmission over the internet, or method of electronic storage is 100% secure.
            </p>
          </section>

          <div className="pt-12 mt-12 border-t border-gray-100 text-center">
            <p className="text-gray-400 font-medium mb-4">Have questions about your data?</p>
            <Link href="/contact" className="inline-block px-8 py-3 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition-all">
              Contact Privacy Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

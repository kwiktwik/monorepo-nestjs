"use client";

import Image from "next/image";
import Link from "next/link";

export default function AlertSoundboxPage() {
  return (
    <div className="bg-white text-gray-900 min-h-[90vh] selection:bg-primary/10 selection:text-primary">
      {/* Hero Section */}
      <section className="relative flex items-center px-4 sm:px-6 lg:px-8 py-20 overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-1/2 h-full -z-10 opacity-20 pointer-events-none">
          <div className="absolute top-[20%] right-[-10%] w-[80%] h-[80%] bg-primary/10 blur-[150px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left Side: Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center px-3 py-1 text-xs font-bold tracking-widest uppercase bg-primary/10 text-primary rounded-lg">
                For Serious Merchants
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05]">
                Alert <span className="text-gradient">Soundbox</span>
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed max-w-xl">
                The loud, clear, and reliable way to receive payment confirmations. Turn any Android phone into a professional UPI soundbox in seconds.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4">
                <a href="https://play.google.com/store/apps/details?id=com.alertspeaker" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105 active:scale-95">
                  <Image 
                    src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                    alt="Get it on Google Play"
                    width={200}
                    height={80}
                    className="h-[75px] w-auto"
                  />
                </a>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-gray-900">4.8/5 Rating</span>
                  <span className="text-xs text-gray-400">Trusted by 10k+ Merchants</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-8 border-t border-gray-100">
                <Link href="/alertpe-soundbox-privacy" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline">Privacy Policy</Link>
                <Link href="/alertpe-soundbox-terms" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline">Terms of Service</Link>
                <Link href="/alertpe-soundbox-cancellation" className="text-sm font-semibold text-gray-400 hover:text-primary transition-colors underline-offset-4 hover:underline">Refund Policy</Link>
              </div>
            </div>

            {/* Right Side: Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary/10 blur-[100px] rounded-full -z-10 opacity-50" />
              <Image 
                src="/kiranaapps/alert-soundbox-mock.png" 
                alt="Alert Soundbox App Mockup" 
                width={380} 
                height={760} 
                className="w-full max-w-sm h-auto drop-shadow-[0_35px_35px_rgba(0,0,0,0.15)] transition-transform duration-700 hover:translate-y-[-10px]"
              />
            </div>

          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <BenefitCard 
              title="Instant Voice Alerts"
              description="Loud and clear announcements for every payment in multiple regional languages."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 000-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>}
            />
            <BenefitCard 
              title="Low Latency"
              description="Get notified immediately as the payment hits your account. No delays, no missed customers."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>}
            />
            <BenefitCard 
              title="Zero Hardware Cost"
              description="Why buy expensive soundboxes? Use the smartphone you already own and save thousands."
              icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function BenefitCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-3xl premium-shadow border border-gray-100">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}

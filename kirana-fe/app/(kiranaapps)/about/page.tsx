"use client";

import Image from "next/image";

export default function KiranaAppsAbout() {
  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 text-sm font-bold tracking-wide text-primary uppercase bg-primary/10 rounded-full">
              Our Mission
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
              Empowering India's <span className="text-gradient">Local Commerce</span>
            </h1>
            <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
              At Kirana Apps, we believe the heart of Indian retail lies in its millions of kirana stores. Our mission is to provide these essential businesses with world-class digital tools that are simple, reliable, and accessible to everyone.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-8">
              <div>
                <h4 className="text-3xl font-extrabold text-primary mb-1">10k+</h4>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Active Merchants</p>
              </div>
              <div>
                <h4 className="text-3xl font-extrabold text-primary mb-1">1M+</h4>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">Payments Alerted</p>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/10 blur-[100px] rounded-full -z-10 opacity-30" />
            <Image 
              src="/kiranaapps/1.png" 
              alt="Kirana Store" 
              width={600} 
              height={400} 
              className="rounded-[3rem] premium-shadow border-8 border-white"
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold mb-8">Simple Tools for Big Dreams</h2>
          <p className="text-lg text-gray-500 leading-relaxed mb-12">
            We started with a simple idea: every merchant deserves a voice for their payments. Today, we're building a full ecosystem that helps kirana stores compete in the digital age without needing expensive hardware or complex training.
          </p>
          <div className="bg-white p-12 rounded-[3.5rem] premium-shadow border border-gray-100 italic text-xl text-gray-700 leading-relaxed">
            "Our goal is to make technology invisible, so merchants can focus on what they do best – serving their customers."
          </div>
        </div>
      </section>
    </div>
  );
}

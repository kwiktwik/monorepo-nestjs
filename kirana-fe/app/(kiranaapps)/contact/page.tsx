"use client";

import Link from "next/link";
import { useState } from "react";

export default function KiranaAppsContact() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          <div className="space-y-12">
            <div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-8">
                Get in <span className="text-gradient">Touch</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-500 leading-relaxed max-w-lg">
                Have questions about our apps or need technical assistance? Our team is here to help you get the most out of Kirana Apps.
              </p>
            </div>

            <div className="space-y-8">
              <ContactMethod 
                title="Customer Support"
                value="support@kiranaapps.com"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
              />
              <ContactMethod 
                title="Call Assistance"
                value="+91 8595404595"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1.061A29 29 0 013 5z"/></svg>}
              />
              <ContactMethod 
                title="Business Hours"
                value="Mon - Sat, 10 AM - 7 PM"
                icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
              />
            </div>
            
            <p className="text-gray-400 font-medium">
              Looking for quick answers? Visit our <Link href="/#faq" className="text-primary hover:underline">FAQ section</Link>.
            </p>
          </div>

          <div className="relative">
            <div className="bg-gray-50 p-10 sm:p-12 rounded-[3.5rem] premium-shadow border border-gray-100">
              {!submitted ? (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Name</label>
                      <input type="text" required className="w-full px-6 py-4 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="Your Name" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-gray-700 ml-1">Phone</label>
                      <input type="tel" required className="w-full px-6 py-4 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="+91 00000 00000" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Email</label>
                    <input type="email" required className="w-full px-6 py-4 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all outline-none" placeholder="store@example.com" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">Message</label>
                    <textarea required className="w-full px-6 py-4 rounded-2xl border-none ring-1 ring-gray-200 focus:ring-2 focus:ring-primary transition-all outline-none min-h-[150px]" placeholder="How can we help you?"></textarea>
                  </div>
                  <button className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-lg shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 transition-all">
                    Send Message
                  </button>
                </form>
              ) : (
                <div className="text-center py-20 animate-in fade-in zoom-in duration-500">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Message Sent!</h3>
                  <p className="text-gray-500">Thank you for reaching out. Our team will get back to you within 24 hours.</p>
                  <button onClick={() => setSubmitted(false)} className="mt-8 text-primary font-bold hover:underline">Send another message</button>
                </div>
              )}
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 blur-[80px] rounded-full -z-10 opacity-30" />
          </div>

        </div>
      </section>
    </div>
  );
}

function ContactMethod({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20 flex-shrink-0">
        {icon}
      </div>
      <div>
        <h4 className="font-bold text-gray-900 mb-1">{title}</h4>
        <p className="text-gray-500 font-medium">{value}</p>
      </div>
    </div>
  );
}

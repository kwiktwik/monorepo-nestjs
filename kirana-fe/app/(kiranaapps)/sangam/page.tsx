"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const RELIGIOUS_CATEGORIES = [
  { name: "Hinduism", accent: "from-orange-500 to-red-600", count: "500+" },
  { name: "Buddhism", accent: "from-amber-400 to-yellow-600", count: "200+" },
  { name: "Sikhism", accent: "from-blue-600 to-indigo-800", count: "150+" },
  { name: "Spirituality", accent: "from-purple-500 to-indigo-600", count: "300+" },
];

export default function SangamLanding() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#FAF9F6] text-[#2C3E50] min-h-screen font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-24 pb-16 px-4">
        {/* Background Gradients */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-200/40 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/40 rounded-full blur-[120px] animate-pulse"></div>
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-orange-100 animate-fade-in text-sm font-bold text-orange-600 tracking-tight">
              <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-ping"></span>
              Join 10,000+ devotees
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] text-gray-900">
              Your Daily Dose of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500">
                Divine Connection
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Experience serene, high-definition religious wallpapers and sacred art for your phone. Connect with the divine every time you unlock your screen.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-5 pt-4">
              <Link 
                href="https://play.google.com/store/apps/details?id=com.sangam.wallpaperapp" 
                className="group relative px-10 py-5 bg-gray-900 text-white font-bold rounded-2xl shadow-xl shadow-gray-200 hover:shadow-2xl hover:shadow-orange-200 hover:-translate-y-1 transition-all duration-300 active:scale-95"
              >
                Download for Android
                <span className="absolute -top-3 -right-3 px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-[10px] uppercase tracking-widest rounded-lg shadow-sm border border-white/20">Free</span>
              </Link>
              <Link 
                href="#categories" 
                className="px-10 py-5 bg-white text-gray-900 font-bold rounded-2xl border border-gray-100 shadow-sm hover:bg-gray-50 hover:border-orange-100 transition-all active:scale-95"
              >
                Explore Art
              </Link>
            </div>
          </div>

          <div className="relative group perspective-1000">
            <div className="relative z-10 transition-transform duration-500 group-hover:rotate-y-6">
              <Image 
                src="/sangam/hero.png" 
                alt="Sangam App Showcase" 
                width={640} 
                height={640} 
                className="w-full h-auto rounded-[3rem] shadow-2xl shadow-orange-900/10 border-8 border-white group-hover:shadow-orange-500/10 transition-all duration-700"
              />
              {/* Floating Decorative Elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 flex flex-col items-center justify-center p-4 animate-bounce-slow">
                <span className="text-2xl">✨</span>
                <p className="text-[10px] font-bold text-center mt-1 text-gray-600">Premium 4K Quality</p>
              </div>
              <div className="absolute -bottom-8 -left-8 w-40 h-16 bg-white/80 backdrop-blur-xl rounded-full shadow-xl border border-white/50 flex items-center justify-center p-4 animate-float">
                <p className="text-xs font-bold text-gray-900">New Art Daily</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section id="categories" className="py-24 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-sm font-bold tracking-[0.3em] uppercase text-orange-500">Our Collection</h2>
            <h3 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">Vibrant Sacred Art</h3>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-medium leading-relaxed">
              Curated artwork featuring deities, sacred symbols, and serene temples from around the world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
            {RELIGIOUS_CATEGORIES.map((cat) => (
              <div 
                key={cat.name} 
                className="group p-8 rounded-[2.5rem] bg-gray-50 border border-gray-100 hover:bg-white hover:border-orange-100 hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-500 cursor-pointer"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${cat.accent} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                  <span className="text-white font-bold text-lg">
                    {cat.name[0]}
                  </span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h4>
                <p className="text-sm text-gray-500 font-bold">{cat.count} Wallpapers</p>
              </div>
            ))}
          </div>

          <div className="relative rounded-[4rem] overflow-hidden bg-gray-900 shadow-3xl group">
             <Image 
                src="/sangam/collection.png" 
                alt="Religious Wallpaper Collection Grid" 
                width={1280} 
                height={800} 
                className="w-full h-auto opacity-90 group-hover:scale-105 transition-transform duration-[20s] linear"
              />
              <div className="absolute inset-x-0 bottom-0 py-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col items-center justify-end px-4 text-center">
                 <h3 className="text-3xl sm:text-4xl font-extrabold text-white mb-6">Experience Divine Serenity</h3>
                 <p className="text-white/80 max-w-xl mx-auto mb-8 font-medium">Beautifully crafted wallpapers that bring peace and mindfulness to your digital life.</p>
                 <Link href="https://play.google.com/store/apps/details?id=com.sangam.wallpaperapp" className="px-10 py-5 bg-orange-500 text-white font-bold rounded-2xl hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20 active:scale-95">Download App Now</Link>
              </div>
          </div>
        </div>
      </section>

      {/* Features List */}
      <section className="py-24 bg-[#FAF9F6] border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
              <div className="flex flex-col items-start gap-4">
                 <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">✨</div>
                 <h4 className="text-xl font-bold text-gray-900 tracking-tight">Exclusive Designs</h4>
                 <p className="text-gray-500 leading-relaxed font-medium">Unique, high-resolution sacred art you won't find anywhere else. All optimized for AMOLED and high-density screens.</p>
              </div>
              <div className="flex flex-col items-start gap-4">
                 <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">📅</div>
                 <h4 className="text-xl font-bold text-gray-900 tracking-tight">Daily Blessings</h4>
                 <p className="text-gray-500 leading-relaxed font-medium">Fresh additions every single day. Celebrate festivals, auspicious days, and spiritual milestones with new art.</p>
              </div>
              <div className="flex flex-col items-start gap-4">
                 <div className="p-4 bg-white rounded-2xl shadow-sm border border-gray-100">🚀</div>
                 <h4 className="text-xl font-bold text-gray-900 tracking-tight">One-Tap Sharing</h4>
                 <p className="text-gray-500 leading-relaxed font-medium">Share your favorite divine art and greetings instantly with friends and family on WhatsApp and Instagram.</p>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden bg-white">
         <div className="max-w-4xl mx-auto px-4 relative z-10 text-center space-y-10">
            <h2 className="text-4xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight">Bring the <span className="text-orange-500">Sangam</span> <br /> to your home screen.</h2>
            <p className="text-xl text-gray-500 max-w-xl mx-auto font-medium leading-relaxed">Download the app today and start your journey towards a more spiritual and peaceful digital space.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="https://play.google.com/store/apps/details?id=com.sangam.wallpaperapp">
                <Image src="/play-store-badge.png" alt="Get it on Google Play" width={200} height={60} className="h-16 w-auto" />
              </Link>
            </div>
         </div>
      </section>

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
        .rotate-y-6 { transform: rotateY(6deg); }
        .text-gradient {
            background: linear-gradient(to right, #ea580c, #f59e0b);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}

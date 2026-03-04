'use client';

import Image from 'next/image';

export default function JamunLanding() {
  const downloadApp = () => {
    // Detect mobile platform and redirect to app store
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // Replace with actual app store links when available
      alert('Download Jamun app from Play Store or App Store!');
    } else {
      alert('Jamun is available on mobile! Scan QR code or visit from your phone.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent"></div>
        <div className="container mx-auto px-4 py-20 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                Share Your
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Festival Joy
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-white/90">
                Add beautiful Indian frames to your photos and share them instantly on WhatsApp! 🎉
              </p>
              <button
                onClick={downloadApp}
                className="group bg-white text-orange-600 px-8 py-4 rounded-full font-bold text-lg shadow-2xl hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2"
              >
                <span>📱 Download App</span>
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-pink-500 rounded-3xl blur-3xl opacity-50 animate-pulse"></div>
              <Image
                src="/jamun/hero.png"
                alt="Festival Celebrations"
                width={600}
                height={400}
                className="relative rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', icon: '�', title: 'Download App', desc: 'Get Jamun on your mobile device' },
              { step: '2', icon: '📸', title: 'Choose Photo', desc: 'Select a photo from gallery or take a new one' },
              { step: '3', icon: '🎨', title: 'Add Frame', desc: 'Apply beautiful Indian festival frames' },
            ].map((item) => (
              <div key={item.step} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-pink-200 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-orange-100 hover:border-orange-300">
                  <div className="text-6xl mb-4">{item.icon}</div>
                  <div className="text-orange-600 font-bold text-sm mb-2">STEP {item.step}</div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-800">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <div className="inline-block bg-gradient-to-br from-green-100 to-green-50 p-8 rounded-2xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <h4 className="text-2xl font-bold text-gray-800">Share on WhatsApp</h4>
              </div>
              <p className="text-gray-600 text-lg">Share your created photos directly with friends and family!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Showcase */}
      <section className="py-20 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 text-white">
            Beautiful Festival Frames ✨
          </h2>
          <p className="text-center text-white/90 text-xl mb-16 max-w-2xl mx-auto">
            Choose from our collection of stunning Indian festival frames
          </p>
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Example 1 */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="bg-white rounded-2xl p-4 mb-4">
                <Image 
                  src="/jamun/frame1.png" 
                  alt="Festival Frame Example" 
                  width={500} 
                  height={500} 
                  className="rounded-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Traditional Festival Frame</h3>
              <p className="text-white/80">Perfect for Diwali, Holi, and other celebrations</p>
            </div>

            {/* Example 2 - WhatsApp Feature */}
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl">
              <div className="bg-white rounded-2xl p-4 mb-4">
                <Image 
                  src="/jamun/whatsapp-feature.png" 
                  alt="WhatsApp Sharing Feature" 
                  width={500} 
                  height={500} 
                  className="rounded-lg"
                />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Instant WhatsApp Sharing</h3>
              <p className="text-white/80">Share your creations with one tap</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
            Why Jamun?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🎨', title: 'Beautiful Frames', desc: 'Exclusive Indian festival and cultural frames' },
              { icon: '⚡', title: 'Instant Sharing', desc: 'Share directly to WhatsApp with one tap' },
              { icon: '🎉', title: 'Free Forever', desc: 'All features completely free, no hidden charges' },
              { icon: '📱', title: 'Mobile First', desc: 'Designed specifically for mobile devices' },
              { icon: '🇮🇳', title: 'Made for India', desc: 'Frames designed for Indian festivals and culture' },
              { icon: '✨', title: 'Easy to Use', desc: 'Simple interface, create photos in seconds' },
            ].map((feature, idx) => (
              <div key={idx} className="text-center p-8 rounded-2xl hover:bg-gradient-to-br hover:from-orange-50 hover:to-pink-50 transition-all duration-300">
                <div className="text-6xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800">{feature.title}</h3>
                <p className="text-gray-600 text-lg">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-pink-500">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Create Amazing Photos?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of Indians sharing festive joy with Jamun!
          </p>
          <button
            onClick={downloadApp}
            className="bg-white text-orange-600 px-12 py-5 rounded-full font-bold text-xl shadow-2xl hover:shadow-white/50 hover:scale-105 transition-all duration-300 inline-flex items-center gap-3"
          >
            <span>📱 Download App Now</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
          <p className="text-white/80 mt-6 text-sm">Available on Android & iOS</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold mb-4">Jamun</h3>
          <p className="text-gray-400 mb-6">Share your festival moments with beautiful frames</p>
          <div className="flex justify-center gap-8 text-sm text-gray-400">
            <a href="/jamun/privacy-policy.md" className="hover:text-white transition">Privacy Policy</a>
            <a href="/jamun/terms-and-service.md" className="hover:text-white transition">Terms of Service</a>
          </div>
          <p className="text-gray-500 mt-8 text-sm">© 2026 Jamun. Made with ❤️ in India</p>
        </div>
      </footer>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}

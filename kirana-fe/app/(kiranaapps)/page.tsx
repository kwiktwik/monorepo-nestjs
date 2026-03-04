"use client";

import Image from "next/image";
import Link from "next/link";

export default function KiranaAppsHome() {
  const apps = [
    {
      id: "alert-soundbox",
      title: "Alert Soundbox",
      description: "Turn your phone into a payment notification soundbox. Get instant audio alerts for every payment received via UPI.",
      image: "/kiranaapps/alert-soundbox-mock.png",
      link: "/alertpe-soundbox",
      badge: "Most Popular"
    },
    {
      id: "jamun-app",
      title: "Jamun",
      description: "Create beautiful Indian festival photos with frames and share instantly on WhatsApp.",
      image: "/jamun/hero.png",
      link: "/jamun",
      badge: "New"
    },
    {
      id: "mobile-soundbox",
      title: "Mobile Soundbox",
      description: "A professional soundbox experience on your mobile. Manage payments, view history, and get voice confirmations.",
      image: "/kiranaapps/2.png",
      link: "#apps",
      badge: "Recommended"
    },
    {
      id: "customer-supplier",
      title: "Customer & Supplier",
      description: "Digital bahi khata for your store. Track credits, manage suppliers, and send automated reminders to customers.",
      image: "/kiranaapps/3.png",
      link: "#apps"
    }
  ];

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-center pt-20 pb-16 overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
          <div className="absolute bottom-[10%] right-[10%] w-[35%] h-[35%] bg-indigo-100 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="inline-block px-4 py-1.5 mb-6 text-sm font-bold tracking-wide text-primary uppercase bg-primary/10 rounded-full">
            The Future of Kirana Commerce
          </div>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight leading-[1.1]">
            Built for Every <span className="text-gradient">Kirana Store 🇮🇳</span>
          </h2>
          <p className="text-lg sm:text-2xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Everything you need to digitize, manage, and grow your kirana business with powerful, simple-to-use apps.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <a href="https://play.google.com/store/apps/details?id=com.alertspeaker" target="_blank" rel="noopener noreferrer" className="transition-transform hover:scale-105 active:scale-95">
              <Image 
                src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                alt="Get it on Google Play"
                width={200}
                height={80}
                className="h-[70px] w-auto"
              />
            </a>
            <Link href="#apps" className="px-8 py-4 text-base font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl transition-all">
              Explore Our Apps
            </Link>
          </div>

          {/* New Marquee */}
          <div className="marquee-container">
            <div className="marquee-content">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={num} className="marquee-item">
                  <Image 
                    src={`/kiranaapps/${num}.png`} 
                    alt="Indian Kirana Store" 
                    width={280} 
                    height={200} 
                    className="marquee-image"
                  />
                </div>
              ))}
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <div key={`dup-${num}`} className="marquee-item">
                  <Image 
                    src={`/kiranaapps/${num}.png`} 
                    alt="Indian Kirana Store" 
                    width={280} 
                    height={200} 
                    className="marquee-image"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Apps Grid Section */}
      <section id="apps" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <div className="text-center mb-16 sm:mb-24">
          <h3 className="text-3xl sm:text-5xl font-bold mb-6">Our Ecosystem of Apps</h3>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Choose the tools that fit your store needs. All apps are interconnected for a seamless experience.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {apps.map((app) => (
            <div key={app.id} className="group relative flex flex-col bg-white rounded-[2.5rem] p-8 border border-gray-100 premium-shadow premium-shadow-hover overflow-hidden">
              {app.badge && (
                <div className="absolute top-6 right-6 px-3 py-1 text-[10px] font-bold tracking-widest uppercase bg-primary text-white rounded-full z-10">
                  {app.badge}
                </div>
              )}
              
              <div className="relative h-64 mb-8 rounded-3xl overflow-hidden bg-gray-50 flex items-center justify-center p-6">
                <Image 
                  src={app.image} 
                  alt={app.title} 
                  width={240} 
                  height={480} 
                  className="h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              <h4 className="text-2xl font-bold mb-4">{app.title}</h4>
              <p className="text-gray-500 text-base leading-relaxed mb-8 flex-grow">
                {app.description}
              </p>

              <Link href={app.link} className="flex items-center justify-center w-full py-4 text-base font-bold text-primary bg-primary/10 hover:bg-primary hover:text-white rounded-2xl transition-all">
                Learn More
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Modernized FAQ Section */}
      <section className="bg-gray-50 py-24 sm:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl sm:text-5xl font-bold mb-6">Common Questions</h3>
            <p className="text-lg text-gray-500">Find quick answers to common inquiries about our platform.</p>
          </div>
          
          <div className="space-y-4">
            <FAQItem 
              question="What is Alert Soundbox?" 
              answer="Alert Soundbox is our flagship app that turns your smartphone into a dedicated payment soundbox. It announces every received UPI payment in a loud, clear voice, saving you money on hardware subscriptions."
            />
            <FAQItem 
              question="Is it free to use?" 
              answer="We offer both free and premium plans. Our basic features are free for small merchants, while advanced business analytics and multi-staff alerts are part of our Pro plans."
            />
            <FAQItem 
              question="Does it work with all UPI apps?" 
              answer="Yes! Our apps are compatible with all major UPI players in India, including Google Pay, PhonePe, Paytm, and BHIM."
            />
            <FAQItem 
              question="Is my business data secure?" 
              answer="Absolutely. We use enterprise-grade encryption and partner with trusted cloud providers like Google Firebase to ensure your data is always safe and backed up."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string, answer: string }) {
  return (
    <details className="group border-none rounded-3xl overflow-hidden premium-shadow bg-white transition-all duration-300">
      <summary className="list-none cursor-pointer px-8 py-6 flex justify-between items-center hover:bg-gray-50 transition">
        <h4 className="text-lg sm:text-xl font-bold text-gray-800">{question}</h4>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary transform group-open:rotate-180 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
        </div>
      </summary>
      <div className="px-8 pb-8">
        <p className="text-base sm:text-lg text-gray-500 leading-relaxed border-t border-gray-100 pt-6">
          {answer}
        </p>
      </div>
    </details>
  );
}

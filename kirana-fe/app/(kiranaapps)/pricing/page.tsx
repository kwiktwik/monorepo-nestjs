"use client";

import Link from "next/link";

export default function KiranaAppsPricing() {
  const plans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for small shops starting their digital journey.",
      features: [
        "Real-time voice alerts",
        "Daily payment history",
        "Single user access",
        "Standard support"
      ],
      cta: "Get Started",
      featured: false
    },
    {
      name: "Pro",
      price: "₹149",
      period: "/month",
      description: "Advanced tools for growing businesses with high volume.",
      features: [
        "Everything in Basic",
        "Multi-staff alerts",
        "Advanced business analytics",
        "Priority 24/7 support",
        "Custom voice settings"
      ],
      cta: "Upgrade to Pro",
      featured: true
    }
  ];

  return (
    <div className="bg-white min-h-[80vh] selection:bg-primary/10 selection:text-primary">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl sm:text-6xl font-extrabold mb-8 tracking-tight">
            Simple, Transparent <span className="text-gradient">Pricing</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-500 leading-relaxed">
            Choose the plan that fits your business. No hidden fees, no complicated setup. Switch or cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.name} 
              className={`relative p-10 rounded-[3rem] border transition-all duration-300 ${
                plan.featured 
                  ? "bg-gray-900 text-white premium-shadow border-gray-800 scale-105" 
                  : "bg-white text-gray-900 border-gray-100 premium-shadow"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1.5 bg-primary text-white text-xs font-bold tracking-widest uppercase rounded-full">
                  Recommended
                </div>
              )}
              
              <div className="mb-10">
                <h3 className="text-2xl font-bold mb-4">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  {plan.period && <span className="text-xl opacity-60 font-semibold">{plan.period}</span>}
                </div>
                <p className={`mt-4 text-sm leading-relaxed ${plan.featured ? "text-gray-400" : "text-gray-500"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-5 mb-12">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-4 text-sm font-semibold">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${plan.featured ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.featured 
                  ? "bg-white text-gray-900 hover:bg-gray-200" 
                  : "bg-primary text-white shadow-xl shadow-primary/10 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center text-sm text-gray-400 font-medium">
          Need a custom plan for multiple locations? <Link href="/contact" className="text-primary hover:underline">Contact sales</Link>
        </div>
      </section>
    </div>
  );
}

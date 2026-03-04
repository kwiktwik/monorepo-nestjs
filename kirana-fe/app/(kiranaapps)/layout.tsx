import Link from "next/link";
import Image from "next/image";

export default function KiranaAppsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white text-gray-900 min-h-screen flex flex-col font-sans selection:bg-primary/10 selection:text-primary">
      <header className="sticky top-0 z-50 glass border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4 flex justify-between items-center">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <Image 
              src="/kiranaapps/logo.png" 
              alt="Kirana Apps" 
              width={140} 
              height={36} 
              className="h-7 sm:h-9 w-auto"
            />
          </Link>
          
          <nav className="flex items-center space-x-6 sm:space-x-10">
            <Link href="/about" className="text-sm font-semibold tracking-tight text-gray-600 hover:text-primary transition-colors">About</Link>
            <Link href="/pricing" className="text-sm font-semibold tracking-tight text-gray-600 hover:text-primary transition-colors">Pricing</Link>
            <Link href="/#apps" className="bg-linear-to-r from-primary to-indigo-700 text-white px-5 py-2 sm:px-7 sm:py-2.5 text-sm sm:text-base font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all">
              Download
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-50 text-gray-900 py-12 sm:py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 sm:gap-16">
            <div className="space-y-6">
              <Image 
                src="/kiranaapps/logo.png" 
                alt="Kirana Apps" 
                width={120} 
                height={32} 
                className="h-6 sm:h-8 opacity-90"
              />
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-xs">
                Empowering India&apos;s kirana stores with simple, powerful digital tools for the modern age.
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:col-span-2">
              <div>
                <h6 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">Product</h6>
                <ul className="space-y-4 text-sm sm:text-base text-gray-600">
                  <li><Link href="/alertpe-soundbox" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Alert Soundbox</Link></li>
                  <li><Link href="/jamun" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Jamun</Link></li>
                  <li><Link href="/#apps" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Mobile Soundbox</Link></li>
                  <li><Link href="/#apps" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Customer & Supplier App</Link></li>
                </ul>
              </div>
              
              <div>
                <h6 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">Legal</h6>
                <ul className="space-y-4 text-sm sm:text-base text-gray-600">
                  <li><Link href="/contact" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Contact Support</Link></li>
                  <li><Link href="/privacy-policy" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Privacy Policy</Link></li>
                  <li><Link href="/terms-of-service" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Terms of Service</Link></li>
                  <li><Link href="/cancellation-refund-policy" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Refund Policy</Link></li>
                  <li><Link href="/delete-account" className="hover:text-primary hover:translate-x-1 inline-block transition-all">Delete Account</Link></li>
                </ul>
              </div>

              <div>
                <h6 className="text-xs uppercase tracking-widest font-bold text-gray-400 mb-6">Contact</h6>
                <ul className="space-y-3 text-sm sm:text-base text-gray-600">
                  <li className="leading-relaxed">
                    61-A, Palam Vihar,<br />
                    Gurgaon, Haryana 122017
                  </li>
                  <li>
                    Phone: <a href="tel:+918595404595" className="hover:text-primary transition-colors">8595404595</a>
                  </li>
                  <li>
                    Email: <a href="mailto:support@kiranaapps.com" className="hover:text-primary transition-colors">support@kiranaapps.com</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-gray-400">
              &copy; {new Date().getFullYear()} LNPK Business Pvt Ltd. All rights reserved.
            </p>
            <p className="text-xs sm:text-sm text-gray-400 flex items-center gap-1">
              Made with <span className="text-red-400">❤️</span> for Indian Merchants
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

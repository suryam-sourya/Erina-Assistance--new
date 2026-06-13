import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 border-t border-gray-800">

      {/* Emergency Hotline Banner */}
      <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-secondary/10 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center shadow-lg shadow-secondary/20">
              <Phone size={18} className="text-secondary" />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">24/7 Emergency Hotline</p>
              <a href="tel:+917340066655" className="text-lg font-black text-white hover:text-secondary transition-colors">
                +91 73400 66655
              </a>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
              <Clock size={12} className="text-emerald-500" />
              <span>Always Available</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-semibold">
              <ShieldCheck size={12} className="text-secondary" />
              <span>Verified Technicians</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative h-10 w-36">
                <Image
                  src="/logo-full.png"
                  alt="Erina Assistance"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-[9px] bg-secondary/20 text-secondary border border-secondary/30 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">BETA</span>
            </Link>
            <div className="text-[11px] text-gray-400 mt-4 leading-relaxed space-y-1">
              <p className="font-bold text-gray-200">Erina Assistance Private Limited</p>
              <p>Shop No. 02, Dinnur Road, Kadugodi</p>
              <p>Bengaluru Karnataka 560067 India</p>
              <p>GSTIN: 29AAJCE0215B1Z6</p>
              <p>07340066655</p>
              <p><a href="mailto:info@erinaassistance.com" className="hover:text-secondary transition-colors">info@erinaassistance.com</a></p>
              <p><a href="https://erinaassistance.in/" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors">https://erinaassistance.in/</a></p>
            </div>
            <div className="flex items-center space-x-4 pt-2">
              <a href="https://www.facebook.com/share/1BHEn3zBxx/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform relative w-7 h-7 block opacity-60 hover:opacity-100">
                <Image src="/facebook.png" alt="Facebook" fill className="object-contain" />
              </a>
              <a href="https://www.linkedin.com/company/erina-assistance/" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform relative w-7 h-7 block opacity-60 hover:opacity-100">
                <Image src="/linkedin.png" alt="LinkedIn" fill className="object-contain" />
              </a>
              <a href="https://www.instagram.com/erinaassistance?igsh=dTFnMmh4NDJqcTRx" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:scale-110 transition-transform w-7 h-7 flex items-center justify-center rounded-lg bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white shadow-md shadow-pink-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://wa.me/917340066655" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform relative w-7 h-7 block opacity-60 hover:opacity-100">
                <Image src="/whatsapp.png" alt="WhatsApp" fill className="object-contain" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-5 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-6 h-0.5 bg-secondary rounded-full" />
            </h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-secondary transition-colors text-[11px]">Home</Link></li>
              <li className="flex flex-col">
                <Link href="/road-trip-calculator" className="hover:text-secondary transition-colors text-[11px]">Trip Calculator</Link>
                <span className="text-[9px] text-primary font-bold mt-0.5">Coming soon</span>
              </li>
              <li><Link href="/membership" className="hover:text-secondary transition-colors text-[11px]">Membership Plans</Link></li>
              <li><Link href="/partner" className="hover:text-secondary transition-colors text-[11px]">Partner With Us</Link></li>
              <li><Link href="/contact" className="hover:text-secondary transition-colors text-[11px]">Contact Us</Link></li>
              <li><Link href="/login" className="hover:text-secondary transition-colors text-[11px]">Customer Login</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-5 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-6 h-0.5 bg-secondary rounded-full" />
            </h3>
            <ul className="space-y-2">
              <li><Link href="/booking?service=towing" className="hover:text-secondary transition-colors text-[11px]">Car Towing</Link></li>
              <li><Link href="/booking?service=bike-towing" className="hover:text-secondary transition-colors text-[11px]">Bike Assistance</Link></li>
              <li><Link href="/booking?service=battery" className="hover:text-secondary transition-colors text-[11px]">Battery Jumpstart</Link></li>
              <li><Link href="/booking?service=fuel" className="hover:text-secondary transition-colors text-[11px]">Fuel Delivery</Link></li>
              <li><Link href="/booking?service=lockout" className="hover:text-secondary transition-colors text-[11px]">Lockout Assistance</Link></li>
              <li><Link href="/booking?service=ev" className="hover:text-secondary transition-colors text-[11px]">EV Charging</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-xs uppercase tracking-wider mb-5 relative inline-block">
              Operations Hub
              <span className="absolute -bottom-2 left-0 w-6 h-0.5 bg-secondary rounded-full" />
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-secondary shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">Shop No. 02, Dinnur Main Road, Kadugodi Colony, Opp: Srihalli Cafe, Bengaluru, Karnataka — 560067</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-secondary shrink-0" />
                <a href="tel:+917340066655" className="text-[11px] hover:text-secondary transition-colors font-semibold">+91 73400 66655</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-secondary shrink-0" />
                <span className="text-[11px]">support@erinaassistance.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-[10px] text-gray-500">
            &copy; {new Date().getFullYear()} Erina Assistance Private Limited. All rights reserved.
          </p>
          <div className="flex gap-4 text-[10px] text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/refund" className="hover:text-white transition-colors">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

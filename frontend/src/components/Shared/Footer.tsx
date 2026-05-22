import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark text-gray-300 pt-16 pb-8 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <div className="relative h-10 w-44">
                <Image
                  src="/logo-full.png"
                  alt="Erina Assistance"
                  fill
                  className="object-contain object-left brightness-0 invert"
                />
              </div>
            </Link>
            <p className="text-sm text-gray-400 mt-4 leading-relaxed">
              24/7 AI-powered roadside assistance. We get you back on the road safely and quickly, anywhere in Bangalore.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-115 transition-transform relative w-7 h-7 block">
                <Image src="/facebook.png" alt="Facebook" fill className="object-contain" />
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="hover:scale-115 transition-transform relative w-7 h-7 block">
                <Image src="/linkedin.png" alt="LinkedIn" fill className="object-contain" />
              </a>
              <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="hover:scale-115 transition-transform relative w-7 h-7 block">
                <Image src="/whatsapp.png" alt="WhatsApp" fill className="object-contain" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Quick Links
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/" className="hover:text-primary transition-colors text-sm">Home</Link></li>
              <li><Link href="/about" className="hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link href="/membership" className="hover:text-primary transition-colors text-sm">Membership Plans</Link></li>
              <li><Link href="/partner" className="hover:text-primary transition-colors text-sm">Partner With Us</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Our Services
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h3>
            <ul className="space-y-3">
              <li><Link href="/#services" className="hover:text-primary transition-colors text-sm">Towing Service</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors text-sm">Flat Tyre</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors text-sm">Battery Jumpstart</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors text-sm">Fuel Delivery</Link></li>
              <li><Link href="/#services" className="hover:text-primary transition-colors text-sm">EV Assistance</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-6 relative inline-block">
              Contact Info
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-primary rounded-full"></span>
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary shrink-0 mt-0.5" />
                <span className="text-sm">123 Tech Park, HSR Layout, Bangalore, 560102</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary shrink-0" />
                <span className="text-sm">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary shrink-0" />
                <span className="text-sm">support@erina-assistance.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Erina Assistance. All rights reserved.
          </p>
          <div className="flex gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

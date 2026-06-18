import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-vlink-trust-deep text-white border-t border-vlink-trust mt-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold font-display">
            <svg className="w-8 h-8 flex-shrink-0" viewBox="0 0 30 30" fill="none">
              <circle cx="15" cy="15" r="14" stroke="#9FC4BC" strokeWidth="2" />
              <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>RescueQR</span>
          </Link>
          <p className="text-vlink-paper/85 text-sm max-w-sm">
            Providing first responders with instant, life-saving medical data when every second counts. Dynamic QR identification cards, stickers, and wristbands powered by Gemini AI.
          </p>
        </div>
        
        <div>
          <h3 className="text-sm font-semibold text-vlink-paper uppercase tracking-wider mb-4 font-mono">Platform</h3>
          <ul className="space-y-2 text-sm text-vlink-paper/75">
            <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link href="/features" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-vlink-paper uppercase tracking-wider mb-4 font-mono">Support</h3>
          <ul className="space-y-2 text-sm text-vlink-paper/75">
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact Form</Link></li>
            <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white transition-colors">FAQ Support</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto border-t border-vlink-trust/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-vlink-paper/60">
        <div>
          © {new Date().getFullYear()} RescueQR. All rights reserved.
        </div>
        <div className="font-mono text-center md:text-right max-w-md">
          DISCLAIMER: RescueQR is an information sharing platform. Scanning QR tags provides reference clinical summaries; it is not a direct healthcare service, a medical diagnosis, or a replacement for calling 112/911/emergency services.
        </div>
      </div>
    </footer>
  );
}

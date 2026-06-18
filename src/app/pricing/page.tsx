"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Check, Star } from "lucide-react";

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "LifeSaver Free",
      price: "0",
      desc: "Essential medical profile and printable emergency QR code.",
      features: [
        "1 Emergency Profile",
        "2 Emergency Contacts",
        "Blood Group & Medical Conditions",
        "Printable QR Code (PNG & SVG)",
        "Basic Triage Page Display",
        "Email Notifications"
      ],
      cta: "Get Started Free",
      href: "/auth/signup",
      popular: false
    },
    {
      name: "VitalLink Premium",
      price: isAnnual ? "24" : "2.99",
      period: isAnnual ? "/ year" : "/ month",
      desc: "Full AI assistance, document vault, and real-time SMS alerts.",
      features: [
        "Unlimited Emergency Contacts",
        "Gemini AI Emergency Summaries",
        "Gemini AI Doctor Assistant Notes",
        "Instant SMS Alerts to family on scan",
        "GPS Scan Location Mapping",
        "Secure Medical Document Storage (PDFs)",
        "Premium QR Stickers & Wristband layouts",
        "Priority 24/7 Support"
      ],
      cta: "Start 14-Day Free Trial",
      href: "/auth/signup",
      popular: true
    }
  ];

  return (
    <>
      <Navbar />
      <main className="py-16 bg-vlink-paper/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-trust font-mono bg-vlink-trust/10 px-3 py-1 rounded-full">
              Simple Pricing
            </span>
            <h1 className="text-4xl font-bold text-vlink-trust-deep font-display sm:text-5xl">
              Protect yourself and your loved ones.
            </h1>
            <p className="text-vlink-ink-soft">
              Every emergency profile includes our core QR system for free. Upgrade to Premium for real-time tracking and clinical AI features.
            </p>
          </div>

          {/* Toggle */}
          <div className="flex justify-center items-center gap-3">
            <span className={`text-sm ${!isAnnual ? "text-vlink-trust-deep font-bold" : "text-vlink-ink-soft"}`}>Monthly Billing</span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="w-12 h-6 bg-vlink-trust rounded-full p-0.5 transition-all focus:outline-none flex items-center"
              style={{ justifyContent: isAnnual ? 'flex-end' : 'flex-start' }}
            >
              <div className="w-5 h-5 bg-white rounded-full shadow-md" />
            </button>
            <span className={`text-sm ${isAnnual ? "text-vlink-trust-deep font-bold" : "text-vlink-ink-soft"}`}>
              Annual Billing <span className="text-vlink-pulse text-xs font-bold font-mono bg-vlink-pulse-dim px-2 py-0.5 rounded-full ml-1">Save 33%</span>
            </span>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
            {plans.map((plan, idx) => (
              <div 
                key={idx} 
                className={`p-8 bg-white border rounded-3xl flex flex-col justify-between relative shadow-sm hover:shadow-md transition-shadow ${
                  plan.popular ? "border-vlink-pulse ring-2 ring-vlink-pulse/20" : "border-vlink-line"
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 right-6 bg-vlink-pulse text-white text-[10px] font-bold uppercase tracking-wider font-mono py-1 px-3 rounded-full flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 fill-white" /> Recommended
                  </span>
                )}
                
                <div>
                  <h3 className="text-xl font-bold text-vlink-trust-deep font-display">{plan.name}</h3>
                  <p className="text-xs text-vlink-ink-soft mt-1.5">{plan.desc}</p>
                  
                  <div className="my-6 flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold text-vlink-trust-deep font-display">${plan.price}</span>
                    <span className="text-sm text-vlink-ink-soft">{plan.period || ""}</span>
                  </div>
                  
                  <hr className="border-vlink-line/60 my-6" />
                  
                  <ul className="space-y-3">
                    {plan.features.map((feat, fidx) => (
                      <li key={fidx} className="flex gap-2.5 items-start text-xs text-vlink-ink-soft">
                        <Check className="w-4 h-4 text-vlink-trust flex-shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="mt-8">
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3.5 px-6 rounded-full text-sm font-bold transition-all ${
                      plan.popular
                        ? "bg-vlink-pulse hover:bg-vlink-pulse/90 text-white shadow-md shadow-vlink-pulse/15 animate-pulse-glow"
                        : "bg-vlink-paper hover:bg-vlink-line text-vlink-trust-deep font-semibold"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

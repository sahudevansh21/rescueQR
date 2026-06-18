import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="py-16 bg-vlink-paper/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-trust font-mono bg-vlink-trust/10 px-3 py-1 rounded-full">
              Our Story
            </span>
            <h1 className="text-4xl font-bold text-vlink-trust-deep font-display sm:text-5xl leading-tight">
              Bridging the gap in critical moments.
            </h1>
            <p className="text-vlink-ink-soft">
              RescueQR was founded to solve a simple problem: in a medical crisis, the person who knows your history, allergies, and contact details isn't always there to speak.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-vlink-trust-deep font-display">Technology in service of life.</h2>
              <p className="text-vlink-ink-soft leading-relaxed text-sm">
                We believe that complex technologies like AI should be applied to make life-saving information immediately digestible. Paramedics, police officers, and bystanders have an average of 4-6 minutes to make critical decisions during major accidents.
              </p>
              <p className="text-vlink-ink-soft leading-relaxed text-sm">
                By offering simple QR identification tags linked to secure profiles and parsed by Google's Gemini models, we enable responders to read a 10-second spoken summary, contact immediate family members, and understand pre-existing conditions without delay.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-vlink-line grid grid-cols-1 gap-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-vlink-pulse-dim text-vlink-pulse flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-vlink-trust-deep font-display">Secured Health Records</h4>
                  <p className="text-xs text-vlink-ink-soft leading-relaxed mt-0.5">
                    We maintain secure, isolated PostgreSQL containers in Supabase to protect your medical details. Data is only exposed during physical QR scans.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-vlink-pulse-dim text-vlink-pulse flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-vlink-trust-deep font-display">Community-First Pricing</h4>
                  <p className="text-xs text-vlink-ink-soft leading-relaxed mt-0.5">
                    Our basic emergency profile, contact listings, and printable QR codes will remain free forever. We support the platform through advanced AI features and document storage options.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-vlink-pulse-dim text-vlink-pulse flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-vlink-trust-deep font-display">Red Cross Collaboration</h4>
                  <p className="text-xs text-vlink-ink-soft leading-relaxed mt-0.5">
                    Our emergency page layout aligns with first-responder requirements, using pulsing red allergy notifications and direct call triggers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

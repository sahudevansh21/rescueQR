import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Users, 
  Activity, 
  Scan, 
  MessageSquare, 
  Sparkles, 
  Lock,
  Compass,
  Printer,
  FileCheck
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <>
      <Navbar />
      <main className="py-16 bg-vlink-paper/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-pulse font-mono bg-vlink-pulse-dim px-3 py-1 rounded-full">
              Full Feature Catalog
            </span>
            <h1 className="text-4xl font-bold text-vlink-trust-deep font-display sm:text-5xl leading-tight">
              Safety features designed for extreme speed.
            </h1>
            <p className="text-vlink-ink-soft">
              Every detail of VitalLink AI is engineered to be visible and functional in the critical moments of an emergency.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Family Accounts",
                desc: "Manage profiles for your spouse, kids, and elderly parents under a single login. Keep track of everyone's emergency tags in one dashboard."
              },
              {
                icon: Activity,
                title: "Full Emergency Profiles",
                desc: "Store 12+ vital medical parameters including blood type, allergies, current medications, doctor contact info, and insurance policy details."
              },
              {
                icon: Scan,
                title: "Dynamic QR Tag Generation",
                desc: "Generate custom QR codes instantly. If you update your medical info in the dashboard, the QR code automatically displays the updated data."
              },
              {
                icon: Compass,
                title: "GPS Location Tracking",
                desc: "Captures approximate GPS coordinates of the responder's scanner (with permission) and uploads details to your activity history feed."
              },
              {
                icon: MessageSquare,
                title: "Automated SMS Warnings",
                desc: "Dispatches real-time SMS alerts to your emergency contacts, notifying them that your tag was scanned, complete with a map location link."
              },
              {
                icon: Sparkles,
                title: "Gemini AI Summary",
                desc: "Converts complex, multi-field clinical data into a concise, scannable responder instruction sheet in under 10 seconds."
              },
              {
                icon: Printer,
                title: "Printable Cards & Stickers",
                desc: "Export your QR code tag directly into a standard ISO wallet card layout, sheet of stickers, or wristband printable template."
              },
              {
                icon: FileCheck,
                title: "Medical Document Vault",
                desc: "Attach PDFs of medical reports, vaccination records, or DNR forms. They remain encrypted and are made visible during scans."
              },
              {
                icon: Lock,
                title: "HIPAA-Aligned Privacy",
                desc: "No search engine indexing of emergency profiles. Your profile is only retrievable via the exact alphanumeric ID generated."
              }
            ].map((feat, idx) => (
              <div key={idx} className="p-8 bg-white border border-vlink-line rounded-3xl hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-vlink-trust/10 flex items-center justify-center text-vlink-trust mb-6">
                  <feat.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-vlink-trust-deep mb-3 font-display">{feat.title}</h3>
                <p className="text-sm text-vlink-ink-soft leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

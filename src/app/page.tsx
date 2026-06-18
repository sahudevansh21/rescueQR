"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Heart, 
  Scan, 
  AlertCircle, 
  Smartphone, 
  Users, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  ChevronDown, 
  MessageSquare, 
  Send,
  HelpCircle,
  Clock,
  Printer,
  X,
  ChevronRight,
  Key
} from "lucide-react";

export default function Home() {
  // Chat Widget State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([
    { role: 'bot', text: "Hi! Ask me how RescueQR works, how to set up a profile, or about pricing." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [customApiKey, setCustomApiKey] = useState("");
  const [isKeyEditing, setIsKeyEditing] = useState(false);

  useEffect(() => {
    const savedKey = localStorage.getItem("rescueqr_gemini_api_key") || "";
    setCustomApiKey(savedKey);
  }, []);

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Sample Interactive AI Profile Briefs
  const [selectedSample, setSelectedSample] = useState(0);
  const samples = [
    {
      name: "Aanya Verma",
      blood: "O+",
      conditions: "Type 1 Diabetes, carry insulin in backpack",
      allergies: "Penicillin, Shellfish",
      contacts: "Priya Verma (Mother) - +91 98888 77777",
      aiBrief: "• CRITICAL: Type 1 Diabetic. Carries insulin in bag. Check blood glucose levels.\n• SEVERE ALLERGY: Avoid Penicillin. Avoid Shellfish.\n• BLOOD GROUP: O positive.\n• CONTACT: Priya Verma (Mother), reachable at +91 98888 77777. Tap to call immediately."
    },
    {
      name: "Kabir Mehta",
      blood: "B-",
      conditions: "Asthma, history of anaphylaxis",
      allergies: "Peanuts, Bee stings",
      contacts: "Dr. Rohit Mehta (Father) - +91 95555 44444",
      aiBrief: "• CRITICAL: Asthmatic. Carries inhaler in side pocket. High risk of peanut anaphylaxis.\n• ALLERGY ALERT: Avoid peanuts/nuts, bee stings. Carry EpiPen.\n• BLOOD GROUP: B negative.\n• EMERGENCY CONTACT: Dr. Rohit Mehta (Father) at +91 95555 44444."
    }
  ];

  const handleChatSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatHistory(prev => [...prev, { role: 'user', text: userText }]);
    setChatMessage("");
    setIsChatLoading(true);

    try {
      // Send to server API route
      const customKey = localStorage.getItem("rescueqr_gemini_api_key") || "";
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(customKey ? { "x-gemini-key": customKey } : {})
        },
        body: JSON.stringify({
          message: userText,
          history: chatHistory.slice(-4)
        })
      });
      const data = await res.json();
      
      if (res.ok) {
        setChatHistory(prev => [...prev, { role: 'bot', text: data.reply }]);
      } else {
        setChatHistory(prev => [...prev, { role: 'bot', text: data.error || "Something went wrong. Please try again." }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'bot', text: "AI assistant is temporarily in offline demo mode. Please save a valid Gemini API Key in the settings (key icon above) to test live answers." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const faqs = [
    {
      q: "Does a first responder need an app to scan the QR code?",
      a: "No. The QR code links directly to a secure, mobile-optimized webpage. Any standard smartphone camera can scan it and load the emergency profile in under 1 second."
    },
    {
      q: "Is my medical and personal data safe?",
      a: "Yes. RescueQR uses row-level encryption and secure database schemas in Supabase. Your emergency details are only shown when someone scans the physical QR code. We do not sell or share your medical data."
    },
    {
      q: "How do the family alerts work?",
      a: "When the QR code is scanned, the page automatically captures GPS coordinates (with the responder's permission) and immediately dispatches an automated SMS alert and email notification to your emergency contacts."
    },
    {
      q: "What types of physical tags are available?",
      a: "You can download your unique QR code in high-resolution PNG or SVG to print it. We also generate print-ready formats for wallet cards, luggage/backpack stickers, and wristband templates."
    }
  ];

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <header className="py-20 bg-gradient-to-b from-vlink-paper via-white to-vlink-paper overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vlink-trust bg-vlink-trust/10 rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5 text-vlink-pulse" /> Emergency ID, Reimagined
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-vlink-trust-deep font-display leading-[1.1]">
              One scan tells responders everything they need to know.
            </h1>
            <p className="text-lg text-vlink-ink-soft max-w-xl">
              RescueQR turns a simple card, sticker, or wristband into a lifeline. In an emergency, first responders instantly access critical medical details, doctor contacts, and AI-guided triage summaries.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/auth/signup" 
                className="px-8 py-4 text-base font-bold text-white bg-vlink-pulse hover:bg-vlink-pulse/95 rounded-full transition-all shadow-md hover:shadow-lg animate-pulse-glow"
              >
                Create emergency profile
              </Link>
              <a 
                href="#how" 
                className="px-8 py-4 text-base font-semibold text-vlink-trust-deep hover:bg-vlink-line/20 rounded-full border border-vlink-line transition-all"
              >
                See how it works
              </a>
            </div>
            <div className="flex flex-wrap gap-6 text-xs text-vlink-ink-soft font-mono pt-4 border-t border-vlink-line/50">
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-vlink-trust" /> NO APP REQUIRED</span>
              <span className="flex items-center gap-1.5"><Heart className="w-4 h-4 text-vlink-pulse" /> INSTANT FAMILY ALERTS</span>
              <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-vlink-trust" /> GEMINI AI SUMMARIES</span>
            </div>
          </div>
          
          <div className="lg:col-span-5 flex justify-center relative">
            <div className="relative w-80 bg-white rounded-3xl border border-vlink-line p-6 shadow-2xl transition-all hover:-translate-y-1 hover:shadow-vlink-trust/10 duration-300">
              <div className="flex justify-between items-center mb-6">
                <span className="text-xs font-mono tracking-wider text-vlink-ink-soft/80">RescueQR · Tag 021</span>
                <Heart className="w-5 h-5 text-vlink-pulse fill-vlink-pulse animate-pulse" />
              </div>
              
              {/* QR Box */}
              <div className="bg-vlink-paper p-4 rounded-2xl border border-vlink-line flex flex-col items-center justify-center aspect-square relative group overflow-hidden">
                <div className="w-full h-full bg-white flex items-center justify-center p-3 rounded-lg border border-vlink-line">
                  {/* Simulate QR Code */}
                  <div className="grid grid-cols-4 gap-2 w-full h-full opacity-85">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`rounded-sm ${(i * 3 + 1) % 4 === 0 || i % 3 === 0 ? 'bg-vlink-trust-deep' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 bg-vlink-trust-deep/80 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Scan className="w-10 h-10 text-vlink-pulse animate-bounce mb-2" />
                  <span className="font-mono text-xs font-semibold">SCAN ME IN AN EMERGENCY</span>
                </div>
              </div>

              <div className="mt-5 space-y-1">
                <h3 className="text-lg font-bold text-vlink-trust-deep font-display">Aanya Verma</h3>
                <p className="text-xs font-mono text-vlink-ink-soft">Blood Group: O+ · Diabetic</p>
              </div>
            </div>
            
            {/* Pop-up alert mockup */}
            <div className="absolute -bottom-6 -right-2 glass-card rounded-2xl p-4 shadow-xl border border-vlink-pulse/30 w-64 animate-bounce duration-[3000ms]">
              <div className="flex gap-2.5 items-start">
                <div className="w-2.5 h-2.5 rounded-full bg-vlink-pulse mt-1.5 animate-ping" />
                <div>
                  <h4 className="text-xs font-bold text-vlink-pulse">SCANNED ✓</h4>
                  <p className="text-[11px] text-vlink-ink-soft leading-tight mt-0.5">
                    Profile accessed in 0.4s. Emergency contacts Priya Verma & Rahul Verma notified via SMS.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Signature ECG Line Divider */}
      <div className="py-2 bg-vlink-paper relative">
        <div className="max-w-7xl mx-auto px-4">
          <svg viewBox="0 0 1180 60" preserveAspectRatio="none" className="w-full h-12 stroke-vlink-line/80 fill-none">
            <path d="M0,30 L500,30 L520,8 L535,52 L550,30 L1180,30" strokeWidth="2" />
            <circle className="pulse-line-blip fill-vlink-pulse" r="4.5">
              <animateMotion dur="4s" repeatCount="indefinite" path="M0,30 L500,30 L520,8 L535,52 L550,30 L1180,30" />
            </circle>
          </svg>
        </div>
      </div>

      {/* Portal Roles Section */}
      <section className="py-12 bg-vlink-paper/50 border-y border-vlink-line/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Customer Role Card */}
            <div className="bg-white p-8 rounded-3xl border border-vlink-line/80 shadow-sm space-y-4 hover:shadow-md hover:border-vlink-trust/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-vlink-pulse/10 text-vlink-pulse flex items-center justify-center">
                  <Heart className="w-6 h-6 fill-vlink-pulse" />
                </div>
                <h3 className="text-xl font-bold text-vlink-trust-deep font-display">Customer Dashboard</h3>
                <p className="text-sm text-vlink-ink-soft leading-relaxed">
                  Register, log in, set up your personal emergency details (contacts, medications, allergies), and generate your unique QR data code. Print it onto wallet cards or helmet stickers.
                </p>
              </div>
              <div className="pt-4 flex gap-4">
                <Link
                  href="/auth/signup"
                  className="px-5 py-2.5 bg-vlink-pulse hover:bg-vlink-pulse/90 text-white font-bold rounded-full text-xs transition-all shadow-sm"
                >
                  Register Patient Profile
                </Link>
                <Link
                  href="/auth/login"
                  className="px-5 py-2.5 border border-vlink-line hover:border-vlink-trust text-vlink-trust-deep font-semibold rounded-full text-xs transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Admin Role Card */}
            <div className="bg-white p-8 rounded-3xl border border-vlink-line/80 shadow-sm space-y-4 hover:shadow-md hover:border-vlink-trust/40 transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-vlink-trust/10 text-vlink-trust flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-vlink-trust-deep font-display">Admin Registry</h3>
                <p className="text-sm text-vlink-ink-soft leading-relaxed">
                  Access the backend patient database directory. Search registered profiles, inspect emergency contact information, review real-time scan events, and analyze Gemini AI engine statistics.
                </p>
              </div>
              <div className="pt-4">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-vlink-trust-deep hover:bg-vlink-trust text-white font-bold rounded-full text-xs transition-all shadow-sm"
                >
                  Access Admin Registry <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-trust font-mono">Simple & Reliable</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-vlink-trust-deep font-display">
              From crisis to coordinated care in four steps.
            </h2>
            <p className="text-vlink-ink-soft">
              No complex mobile apps to download, no hardware to charge. Just immediate access when it matters most.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Bystander scans tag",
                desc: "Any phone camera works. A responder scans the physical card or sticker on your wristband or backpack."
              },
              {
                step: "02",
                title: "GPS location captured",
                desc: "The browser requests location permission to log exactly where the emergency occurred."
              },
              {
                step: "03",
                title: "Profile opens in 0.4s",
                desc: "Medical conditions, blood groups, insurance details, and primary doctors load instantly."
              },
              {
                step: "04",
                title: "SMS alert dispatched",
                desc: "Your emergency contacts receive an instant text message with your active GPS coordinates."
              }
            ].map((item, idx) => (
              <div key={idx} className="relative p-6 bg-vlink-paper/40 rounded-2xl border border-vlink-line/60 hover:border-vlink-trust/40 transition-colors">
                <div className="text-sm font-bold text-vlink-pulse font-mono mb-4">BEAT {item.step}</div>
                <h3 className="text-lg font-bold text-vlink-trust-deep mb-2 font-display">{item.title}</h3>
                <p className="text-sm text-vlink-ink-soft leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase Section */}
      <section className="py-20 bg-vlink-trust-deep text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-pulse font-mono">Safety-critical design</span>
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Built for emergencies, not just demos.</h2>
            <p className="text-vlink-paper/75 text-sm">
              We design every feature around speed, legibility, and high-stress readability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: AlertCircle,
                title: "Flashing Vitals Banner",
                desc: "Life-threatening allergies and blood group are displayed first in a high-contrast pulsing red header."
              },
              {
                icon: Smartphone,
                title: "One-Click Calls",
                desc: "Responders can call primary contacts directly from the landing page with a single touch, no dialing required."
              },
              {
                icon: Clock,
                title: "Scan Log Audit",
                desc: "Real-time history feed in your dashboard logs exactly when and where your card was scanned."
              },
              {
                icon: Printer,
                title: "Printable Templates",
                desc: "Format and print your QR onto cards, luggage stickers, or wristband templates in standard dimensions."
              },
              {
                icon: ShieldCheck,
                title: "Medical Document Vault",
                desc: "Store insurance policies and medical reports securely, unlocked only during responder scans."
              },
              {
                icon: Users,
                title: "Family Monitoring",
                desc: "Add multiple children, elderly parents, or pet accounts under a single billing subscription."
              }
            ].map((feat, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-vlink-trust-deep border border-white/10 hover:border-white/20 transition-all">
                <feat.icon className="w-8 h-8 text-vlink-pulse mb-4" />
                <h3 className="text-lg font-bold mb-2 font-display">{feat.title}</h3>
                <p className="text-sm text-vlink-paper/75 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI capabilities section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-vlink-pulse bg-vlink-pulse-dim rounded-full font-mono">
              <Sparkles className="w-3.5 h-3.5" /> Gemini AI Integration
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-vlink-trust-deep font-display leading-[1.2]">
              Instant AI summaries when seconds count.
            </h2>
            <p className="text-vlink-ink-soft">
              Raw medical charts and fields are hard to scan in a panic. Our Gemini AI system parses your profile details and generates instant, calm, and actionable guidelines for responder teams.
            </p>
            
            <div className="space-y-3">
              {[
                { title: "AI Emergency Summary", desc: "A 10-second first-responder overview highlighting life-saving notes." },
                { title: "AI Doctor Assistant", desc: "A clinical history synopsis for hospital triage and doctor handoffs." },
                { title: "AI Family Guidance", desc: "Clear step-by-step next actions and preparation checklists for family members." },
                { title: "AI Medical Insights", desc: "Identifies prescription drug conflicts and generates emergency preparedness scores." }
              ].map((aiItem, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded-full bg-vlink-trust/10 flex items-center justify-center mt-0.5 text-vlink-trust font-bold text-xs font-mono">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-vlink-trust-deep">{aiItem.title}</h4>
                    <p className="text-xs text-vlink-ink-soft">{aiItem.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-vlink-paper/40 p-6 sm:p-8 rounded-3xl border border-vlink-line">
            <div className="flex gap-2 justify-center mb-6">
              {samples.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedSample(idx)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                    selectedSample === idx
                      ? "bg-vlink-trust-deep text-white border-transparent"
                      : "bg-white text-vlink-ink border-vlink-line hover:border-vlink-trust"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 border border-vlink-line space-y-4">
              <div>
                <h4 className="text-xs font-mono text-vlink-ink-soft uppercase tracking-wider mb-1">Input Fields</h4>
                <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-vlink-paper/50 rounded-lg font-mono">
                  <div>Blood Group: {samples[selectedSample].blood}</div>
                  <div>Allergies: {samples[selectedSample].allergies}</div>
                  <div className="col-span-2">Conditions: {samples[selectedSample].conditions}</div>
                </div>
              </div>

              <div className="border-t border-vlink-line/60 pt-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Sparkles className="w-4 h-4 text-vlink-pulse" />
                  <h4 className="text-xs font-bold text-vlink-trust-deep font-mono uppercase tracking-wider">Gemini Response Brief</h4>
                </div>
                <div className="bg-vlink-trust-deep text-vlink-paper p-4 rounded-xl text-xs font-mono whitespace-pre-line leading-relaxed shadow-inner">
                  {samples[selectedSample].aiBrief}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-vlink-paper/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-trust font-mono">Real-world impact</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-vlink-trust-deep font-display">Stories that shape our mission.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "My father wanders occasionally due to early dementia. The keychain QR card has helped neighbors contact us and bring him back safely twice.",
                name: "Rohan Nair",
                loc: "Pune, India"
              },
              {
                quote: "Paramedics scanned my backpack tag after a cycling crash and saw my blood thinners warning. They told me it prevented critical complications.",
                name: "Sana Kulkarni",
                loc: "Bengaluru, India"
              },
              {
                quote: "I put tags on my kids' schoolbags. The UI was so simple, I was able to set both profiles and print the cards in less than 10 minutes.",
                name: "Arjun Diwan",
                loc: "Indore, India"
              }
            ].map((t, idx) => (
              <div key={idx} className="p-6 bg-white rounded-2xl border border-vlink-line flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm text-vlink-ink italic leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-vlink-pulse-dim text-vlink-pulse flex items-center justify-center font-bold text-sm font-display">
                    {t.name[0]}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-vlink-trust-deep">{t.name}</h4>
                    <p className="text-xs text-vlink-ink-soft">{t.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-vlink-trust font-mono animate-pulse-glow"><HelpCircle className="inline-block w-4 h-4 mr-1" /> FAQ</span>
            <h2 className="text-3xl font-bold text-vlink-trust-deep font-display">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-vlink-line rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-5 flex justify-between items-center bg-vlink-paper/20 hover:bg-vlink-paper/40 transition-colors"
                >
                  <span className="font-bold text-vlink-trust-deep text-sm sm:text-base">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-vlink-trust transition-transform ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === idx && (
                  <div className="px-6 py-5 bg-white border-t border-vlink-line text-sm text-vlink-ink-soft leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Landing Page Bottom CTA */}
      <section className="px-4 py-16 bg-white">
        <div className="max-w-5xl mx-auto bg-vlink-pulse rounded-3xl p-8 sm:p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-bold font-display">Get peace of mind, before you need it.</h2>
            <p className="text-vlink-paper/90 text-sm sm:text-base">
              Set up your unique profile in under five minutes. Download, print, or share your Emergency QR code tag to ensure safety.
            </p>
            <div>
              <Link 
                href="/auth/signup" 
                className="inline-block px-8 py-4 bg-white text-vlink-pulse hover:bg-vlink-paper font-bold rounded-full transition-all shadow-md hover:shadow-lg"
              >
                Register profile now
              </Link>
            </div>
          </div>
          {/* Subtle background decoration */}
          <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full border-4 border-white/10" />
          <div className="absolute -left-20 -top-20 w-60 h-60 rounded-full border-4 border-white/10" />
        </div>
      </section>

      <Footer />

      {/* Floating Support Chat Widget */}
      <div className="fixed bottom-6 right-6 z-[99]">
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 rounded-full bg-vlink-trust-deep hover:bg-vlink-trust text-white flex items-center justify-center shadow-xl hover:scale-105 transition-all focus:outline-none border border-white/20 animate-beacon"
          aria-label="Ask RescueQR Support"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
        
        {isChatOpen && (
          <div className="absolute bottom-16 right-0 w-80 bg-white border border-vlink-line rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-250">
            <div className="bg-vlink-trust-deep text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-sm font-display flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-vlink-pulse" /> Ask RescueQR
                </h3>
                <p className="text-[10px] text-vlink-paper/70 font-mono mt-0.5">Gemini-powered customer agent</p>
              </div>
              <button 
                onClick={() => setIsKeyEditing(!isKeyEditing)}
                className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors focus:outline-none"
                title="Configure Gemini API Key"
              >
                <Key className="w-4 h-4" />
              </button>
            </div>
            
            {isKeyEditing && (
              <div className="bg-[#fafafa] border-b border-vlink-line p-3 space-y-2 text-xs">
                <div className="font-bold text-[#333]">Gemini API Key:</div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    placeholder="Enter API Key..."
                    value={customApiKey}
                    onChange={(e) => setCustomApiKey(e.target.value)}
                    className="flex-1 px-2.5 py-1.5 border border-vlink-line rounded-lg text-xs outline-none focus:border-vlink-trust bg-white font-mono text-vlink-ink"
                  />
                  <button
                    onClick={() => {
                      localStorage.setItem("rescueqr_gemini_api_key", customApiKey.trim());
                      setIsKeyEditing(false);
                    }}
                    className="px-3 py-1.5 bg-vlink-pulse text-white font-bold rounded-lg text-[10px] uppercase hover:bg-vlink-pulse/90 focus:outline-none"
                  >
                    Save
                  </button>
                </div>
                <p className="text-[9px] text-[#666] leading-tight">
                  Saved locally in your browser. Used to enable live support chat.
                </p>
              </div>
            )}
            
            <div className="flex-1 h-64 overflow-y-auto p-4 space-y-3 bg-vlink-paper/20">
              {chatHistory.map((msg, i) => (
                <div 
                  key={i} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-vlink-trust-deep text-white rounded-br-none' 
                      : 'bg-white border border-vlink-line text-vlink-ink rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-vlink-line rounded-2xl rounded-bl-none px-3.5 py-2 text-xs text-vlink-ink-soft italic flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-vlink-pulse animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-vlink-pulse animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-vlink-pulse animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleChatSend} className="flex border-t border-vlink-line">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type your question..."
                className="flex-1 border-none px-4 py-3 text-xs outline-none bg-white"
              />
              <button 
                type="submit" 
                className="px-4 bg-vlink-pulse hover:bg-vlink-pulse/90 text-white flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

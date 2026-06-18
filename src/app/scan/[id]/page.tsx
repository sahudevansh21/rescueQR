"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Heart, 
  PhoneCall, 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Sparkles, 
  FileText, 
  Home, 
  Clock, 
  Users,
  AlertOctagon
} from "lucide-react";
import { supabase, isRealSupabase } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  blood_group: string;
  date_of_birth: string;
  address: string;
  medical_conditions: string;
  allergies: string;
  current_medications: string;
  organ_donor: boolean;
  insurance_provider: string;
  insurance_policy_number: string;
  primary_doctor_name: string;
  primary_doctor_phone: string;
  is_premium: boolean;
}

interface Contact {
  id: string;
  profile_id?: string;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary: boolean;
}

export default function ScanPage() {
  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeTab, setActiveTab] = useState<"responder" | "clinical" | "family" | "insights">("responder");

  // Loading & Action states
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Acquiring GPS location...");
  const [alertsSent, setAlertsSent] = useState(false);
  
  // AI content states
  const [aiBrief, setAiBrief] = useState("");
  const [isBriefLoading, setIsBriefLoading] = useState(false);
  
  const [aiDoctorNotes, setAiDoctorNotes] = useState("");
  const [isDoctorNotesLoading, setIsDoctorNotesLoading] = useState(false);
  
  const [aiFamilyChecklist, setAiFamilyChecklist] = useState("");
  const [isFamilyLoading, setIsFamilyLoading] = useState(false);
  
  const [aiInsights, setAiInsights] = useState<{
    score: number;
    risks: string[];
    conflicts: string[];
    tips: string[];
  } | null>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmergencyProfile();
    }
  }, [id]);

  const loadEmergencyProfile = async () => {
    setIsLoading(true);
    let fetchedProfile: Profile | null = null;
    let fetchedContacts: Contact[] = [];

    if (isRealSupabase) {
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", id)
          .maybeSingle();
        fetchedProfile = data;

        if (fetchedProfile) {
          const { data: contactsData } = await supabase
            .from("emergency_contacts")
            .select("*")
            .eq("profile_id", id);
          fetchedContacts = contactsData || [];
        }
      } catch (err) {
        console.error("Supabase load failed:", err);
      }
    } else {
      // Mock mode
      const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
      const mockProfiles = JSON.parse(mockProfilesStr);
      fetchedProfile = mockProfiles.find((p: any) => p.id === id) || null;

      // Seed Aanya Verma for local testing
      if (!fetchedProfile && id === "aanya-verma") {
        fetchedProfile = {
          id: "aanya-verma",
          full_name: "Aanya Verma",
          blood_group: "O+",
          date_of_birth: "1995-04-12",
          address: "74, Park Street, Bengaluru, Karnataka, India",
          medical_conditions: "Type 1 diabetes, carries insulin in bag.",
          allergies: "Penicillin, Shellfish",
          current_medications: "Humalog (Insulin Lyspro), Metformin",
          organ_donor: true,
          insurance_provider: "Care Health Insurance",
          insurance_policy_number: "CHI-99887722-A",
          primary_doctor_name: "Dr. Ramesh Nair",
          primary_doctor_phone: "+91 98765 43210",
          is_premium: true
        };
      }

      if (fetchedProfile) {
        const mockContactsStr = localStorage.getItem("vlink_contacts") || "[]";
        const mockContacts = JSON.parse(mockContactsStr);
        fetchedContacts = mockContacts.filter((c: any) => c.profile_id === id);

        if (fetchedContacts.length === 0 && id === "aanya-verma") {
          fetchedContacts = [
            {
              id: 'c1',
              profile_id: 'aanya-verma',
              name: 'Priya Verma (Mother)',
              relationship: 'Mother',
              phone_number: '+91 98888 77777',
              is_primary: true
            },
            {
              id: 'c2',
              profile_id: 'aanya-verma',
              name: 'Rahul Verma (Brother)',
              relationship: 'Brother',
              phone_number: '+91 96666 55555',
              is_primary: false
            }
          ];
        }
      }
    }

    if (!fetchedProfile) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    setProfile(fetchedProfile);
    setContacts(fetchedContacts);
    setIsLoading(false);
    
    // Auto-request location and submit scan event
    captureLocationAndLog(fetchedProfile, fetchedContacts);
    
    // Auto-load AI Summary (Feature A)
    fetchAiBrief(fetchedProfile);
  };

  const captureLocationAndLog = (profileObj: Profile, contactsList: Contact[]) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsStatus(`GPS acquired: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          await triggerScanEvent(profileObj, contactsList, lat, lng);
        },
        async (err) => {
          setGpsStatus("GPS permission denied by browser. Logging scan without location.");
          await triggerScanEvent(profileObj, contactsList);
        }
      );
    } else {
      setGpsStatus("Geolocation not supported. Logging scan.");
      triggerScanEvent(profileObj, contactsList);
    }
  };

  const triggerScanEvent = async (
    profileObj: Profile, 
    contactsList: Contact[], 
    lat?: number, 
    lng?: number
  ) => {
    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: profileObj.id,
          latitude: lat,
          longitude: lng,
          user_agent: navigator.userAgent
        })
      });
      if (res.ok) {
        setAlertsSent(true);
      }
    } catch (e) {
      console.error("Failed to log scan or send alerts:", e);
    }
  };

  // Feature A: AI Emergency Brief
  const fetchAiBrief = async (profileObj: Profile) => {
    setIsBriefLoading(true);
    try {
      const res = await fetch("/api/ai/summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: profileObj })
      });
      const data = await res.json();
      setAiBrief(data.summary || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsBriefLoading(false);
    }
  };

  // Feature B: AI Doctor Notes
  const fetchAiDoctorNotes = async () => {
    if (aiDoctorNotes || !profile) return;
    setIsDoctorNotesLoading(true);
    try {
      const res = await fetch("/api/ai/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile })
      });
      const data = await res.json();
      setAiDoctorNotes(data.notes || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsDoctorNotesLoading(false);
    }
  };

  // Feature C: AI Family Checklist
  const fetchAiFamilyChecklist = async () => {
    if (aiFamilyChecklist || !profile) return;
    setIsFamilyLoading(true);
    try {
      const res = await fetch("/api/ai/guidance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile })
      });
      const data = await res.json();
      setAiFamilyChecklist(data.guidance || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsFamilyLoading(false);
    }
  };

  // Feature D: AI Medical Insights
  const fetchAiInsights = async () => {
    if (aiInsights || !profile) return;
    setIsInsightsLoading(true);
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile })
      });
      const data = await res.json();
      setAiInsights(data.insights || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsInsightsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "clinical") fetchAiDoctorNotes();
    if (activeTab === "family") fetchAiFamilyChecklist();
    if (activeTab === "insights") fetchAiInsights();
  }, [activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vlink-trust-deep text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-vlink-paper border-t-vlink-pulse rounded-full animate-spin" />
        <p className="text-sm font-mono text-vlink-paper/80">Accessing Emergency Profile...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-vlink-trust-deep text-white flex flex-col items-center justify-center gap-4 p-4 text-center">
        <AlertOctagon className="w-16 h-16 text-vlink-pulse" />
        <h1 className="text-2xl font-bold font-display">Profile Not Found</h1>
        <p className="text-sm text-vlink-paper/70 max-w-sm">
          The emergency QR code scanned does not exist or has been deactivated by the user.
        </p>
        <Link href="/" className="mt-4 px-6 py-2.5 bg-white text-vlink-trust-deep font-bold rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vlink-trust-deep text-vlink-ink p-4 sm:p-6 flex justify-center items-start">
      <div className="w-full max-w-2xl bg-vlink-paper rounded-3xl overflow-hidden shadow-2xl border border-white/10">
        
        {/* Pulsing Beacon Banner */}
        <div className="bg-vlink-pulse text-white px-4 py-3 text-center flex items-center justify-center gap-2 font-mono text-xs font-bold uppercase tracking-wider animate-beacon z-10">
          <Activity className="w-4.5 h-4.5 animate-pulse" /> Emergency Tag Scanned
        </div>

        {/* GPS Location status */}
        <div className="bg-white/95 px-4 py-2 border-b border-vlink-line text-[10px] font-mono text-vlink-ink-soft flex justify-between gap-4">
          <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-vlink-pulse" /> {gpsStatus}</span>
          {alertsSent && <span className="text-vlink-success font-bold">✓ FAMILY ALERTERS NOTIFIED</span>}
        </div>

        {/* Profile Card Intro */}
        <div className="p-6 bg-white border-b border-vlink-line flex flex-col sm:flex-row gap-6 justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-vlink-trust-deep font-display leading-tight">{profile.full_name}</h2>
            <span className="text-xs font-mono text-vlink-ink-soft block">Date of Birth: {profile.date_of_birth || "Not provided"}</span>
          </div>

          {/* Blood group display */}
          <div className="bg-vlink-pulse text-white py-3 px-6 rounded-2xl flex flex-col items-center justify-center border-2 border-white/25 shadow-lg animate-pulse">
            <span className="text-[10px] font-mono font-bold leading-none tracking-widest">BLOOD TYPE</span>
            <span className="text-2xl font-extrabold font-display leading-none mt-1">{profile.blood_group || "N/A"}</span>
          </div>
        </div>

        {/* Tabs for responders, clinical and family */}
        <div className="flex bg-vlink-paper border-b border-vlink-line p-2 gap-1 overflow-x-auto">
          {[
            { id: "responder", label: "Responder View", icon: Heart },
            { id: "clinical", label: "Clinical Details", icon: FileText },
            { id: "family", label: "Family / Next Steps", icon: Users },
            { id: "insights", label: "AI Insights", icon: Sparkles }
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === t.id
                  ? "bg-vlink-trust-deep text-white shadow-sm"
                  : "text-vlink-ink-soft hover:bg-vlink-line/20 hover:text-vlink-trust-deep"
              }`}
            >
              <t.icon className={`w-4 h-4 ${activeTab === t.id && t.id === 'responder' ? 'text-vlink-pulse' : ''}`} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Sheets */}
        <div className="p-6 space-y-6">
          
          {/* TAB 1: Responder View */}
          {activeTab === "responder" && (
            <div className="space-y-6">
              
              {/* Feature A: Gemini AI Emergency Brief */}
              <div className="bg-vlink-trust-deep text-white p-5 rounded-2xl border border-vlink-trust space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono tracking-wider uppercase text-vlink-pulse flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> AI Emergency Summary
                  </span>
                  <span className="text-[8px] font-mono text-vlink-paper/50">Gemini-2.5-Flash</span>
                </div>
                {isBriefLoading ? (
                  <div className="text-xs text-vlink-paper/60 italic animate-pulse">Analyzing profile fields...</div>
                ) : (
                  <p className="text-xs font-mono leading-relaxed whitespace-pre-line text-vlink-paper">
                    {aiBrief || "No profile fields filled for analysis."}
                  </p>
                )}
                {/* Background pulse decoration */}
                <div className="absolute -right-6 -bottom-6 w-16 h-16 rounded-full bg-vlink-pulse/10" />
              </div>

              {/* Critical Alerts Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-vlink-line/80 border-l-4 border-l-vlink-pulse space-y-1">
                  <span className="text-[10px] font-mono text-vlink-ink-soft uppercase tracking-wider font-semibold">ALLERGIES</span>
                  <p className="text-sm font-extrabold text-vlink-pulse">{profile.allergies || "No drug/food allergies reported."}</p>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-vlink-line/80 border-l-4 border-l-vlink-trust space-y-1">
                  <span className="text-[10px] font-mono text-vlink-ink-soft uppercase tracking-wider font-semibold">MEDICAL CONDITIONS</span>
                  <p className="text-xs font-bold text-vlink-trust-deep leading-relaxed">{profile.medical_conditions || "No chronic medical conditions listed."}</p>
                </div>
              </div>

              {/* Medications */}
              <div className="bg-white p-5 rounded-2xl border border-vlink-line space-y-2">
                <span className="text-[10px] font-mono text-vlink-ink-soft uppercase tracking-wider font-semibold">CURRENT MEDICATIONS</span>
                <p className="text-xs leading-relaxed text-vlink-ink font-mono whitespace-pre-line">{profile.current_medications || "No medications specified."}</p>
              </div>

              {/* Emergency Contacts with Click to Call */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-vlink-trust-deep font-mono uppercase tracking-wider">Emergency Contacts</h4>
                
                {contacts.length === 0 ? (
                  <div className="text-xs text-vlink-ink-soft italic p-3 bg-white border border-vlink-line rounded-xl text-center">
                    No emergency contacts provided.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {contacts.map((c) => (
                      <div key={c.id} className="p-4 bg-white border border-vlink-line rounded-2xl flex items-center justify-between shadow-sm">
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-vlink-trust-deep flex items-center gap-1.5">
                            {c.name}
                            {c.is_primary && (
                              <span className="bg-vlink-pulse text-white text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">Primary</span>
                            )}
                          </span>
                          <span className="text-[10px] text-vlink-ink-soft block">{c.relationship} · {c.phone_number}</span>
                        </div>
                        <a
                          href={`tel:${c.phone_number}`}
                          className="w-10 h-10 rounded-full bg-vlink-success hover:bg-vlink-success/90 text-white flex items-center justify-center shadow"
                          aria-label={`Call ${c.name}`}
                        >
                          <PhoneCall className="w-4.5 h-4.5" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Clinical Details */}
          {activeTab === "clinical" && (
            <div className="space-y-6">
              {/* Feature B: Gemini AI Doctor Assistant Notes */}
              <div className="bg-white p-5 rounded-2xl border border-vlink-line space-y-4">
                <div className="flex items-center gap-2 border-b border-vlink-line pb-2.5">
                  <Sparkles className="w-5 h-5 text-vlink-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-vlink-trust-deep font-display">AI Doctor Assistant</h4>
                    <span className="text-[9px] text-vlink-ink-soft font-mono">Clinical overview sheet for medical professionals</span>
                  </div>
                </div>

                {isDoctorNotesLoading ? (
                  <div className="text-xs text-vlink-ink-soft italic animate-pulse">Synthesizing clinical summary...</div>
                ) : (
                  <div className="text-xs font-mono leading-relaxed whitespace-pre-line text-vlink-trust-deep">
                    {aiDoctorNotes || "Error parsing clinical overview."}
                  </div>
                )}
              </div>

              {/* Insurance Info */}
              <div className="bg-white p-5 rounded-2xl border border-vlink-line space-y-4">
                <h4 className="text-xs font-bold text-vlink-trust-deep font-mono uppercase tracking-wider">Insurance Details</h4>
                <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-vlink-ink-soft block">PROVIDER</span>
                    <span className="font-bold">{profile.insurance_provider || "Not specified"}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-vlink-ink-soft block">POLICY NUMBER</span>
                    <span className="font-bold">{profile.insurance_policy_number || "Not specified"}</span>
                  </div>
                </div>
              </div>

              {/* Doctor Details */}
              <div className="bg-white p-5 rounded-2xl border border-vlink-line space-y-4">
                <h4 className="text-xs font-bold text-vlink-trust-deep font-mono uppercase tracking-wider">Primary Care Doctor</h4>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-vlink-trust-deep font-bold block">{profile.primary_doctor_name || "Doctor name not listed"}</span>
                    <span className="text-[10px] text-vlink-ink-soft font-mono block mt-0.5">Phone: {profile.primary_doctor_phone || "N/A"}</span>
                  </div>
                  {profile.primary_doctor_phone && (
                    <a
                      href={`tel:${profile.primary_doctor_phone}`}
                      className="w-10 h-10 rounded-full bg-vlink-trust hover:bg-vlink-trust/95 text-white flex items-center justify-center shadow"
                    >
                      <PhoneCall className="w-4.5 h-4.5" />
                    </a>
                  )}
                </div>
              </div>

              {/* Organ donor status */}
              {profile.organ_donor && (
                <div className="bg-green-50 text-vlink-success border border-green-200 p-4 rounded-2xl flex items-center gap-2 font-mono text-xs font-bold">
                  ✓ REGISTERED ORGAN DONOR
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Family Guidance */}
          {activeTab === "family" && (
            <div className="space-y-6">
              {/* Feature C: Gemini AI Family Guidance */}
              <div className="bg-white p-5 rounded-2xl border border-vlink-line space-y-4">
                <div className="flex items-center gap-2 border-b border-vlink-line pb-2.5">
                  <Sparkles className="w-5 h-5 text-vlink-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-vlink-trust-deep font-display">AI Family Companion</h4>
                    <span className="text-[9px] text-vlink-ink-soft font-mono">Simple status explanation & hospital checklists</span>
                  </div>
                </div>

                {isFamilyLoading ? (
                  <div className="text-xs text-vlink-ink-soft italic animate-pulse">Formulating guidance checklist...</div>
                ) : (
                  <div className="text-xs font-mono leading-relaxed whitespace-pre-line text-vlink-ink">
                    {aiFamilyChecklist || "Error generating checklist."}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: AI Insights */}
          {activeTab === "insights" && (
            <div className="space-y-6">
              {/* Feature D: Gemini AI Medical Insights */}
              <div className="bg-white p-5 rounded-2xl border border-vlink-line space-y-4">
                <div className="flex items-center gap-2 border-b border-vlink-line pb-2.5">
                  <Sparkles className="w-5 h-5 text-vlink-pulse" />
                  <div>
                    <h4 className="text-sm font-bold text-vlink-trust-deep font-display">AI Medical Insights</h4>
                    <span className="text-[9px] text-vlink-ink-soft font-mono">Preparedness audit & medication conflicts</span>
                  </div>
                </div>

                {isInsightsLoading ? (
                  <div className="text-xs text-vlink-ink-soft italic animate-pulse">Running diagnostic check...</div>
                ) : aiInsights ? (
                  <div className="space-y-5 text-xs">
                    
                    {/* Score Bar */}
                    <div className="flex items-center gap-3">
                      <span className="font-bold font-mono text-vlink-trust-deep">Emergency Readiness:</span>
                      <div className="flex-1 bg-vlink-paper rounded-full h-3 overflow-hidden border border-vlink-line">
                        <div 
                          className="bg-vlink-pulse h-full rounded-full" 
                          style={{ width: `${aiInsights.score}%` }} 
                        />
                      </div>
                      <span className="font-bold font-mono text-vlink-pulse">{aiInsights.score}/100</span>
                    </div>

                    <hr className="border-vlink-line/60" />

                    {/* Safety Risks */}
                    <div className="space-y-2">
                      <span className="font-bold font-mono uppercase text-vlink-pulse tracking-wider block">Safety Risks</span>
                      <ul className="space-y-1.5 list-disc pl-4 text-vlink-ink-soft">
                        {aiInsights.risks.map((r, i) => (
                          <li key={i} className="leading-relaxed">{r}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Drug conflicts */}
                    <div className="space-y-2">
                      <span className="font-bold font-mono uppercase text-vlink-trust tracking-wider block">Medication Warnings</span>
                      <ul className="space-y-1.5 list-disc pl-4 text-vlink-ink-soft">
                        {aiInsights.conflicts.map((c, i) => (
                          <li key={i} className="leading-relaxed">{c}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Preparation Tips */}
                    <div className="space-y-2 bg-vlink-paper/50 p-4 rounded-2xl border border-vlink-line">
                      <span className="font-bold font-mono uppercase text-vlink-trust-deep tracking-wider block">Actionable Tips</span>
                      <ul className="space-y-1.5 list-decimal pl-4 text-vlink-ink-soft">
                        {aiInsights.tips.map((t, i) => (
                          <li key={i} className="leading-relaxed">{t}</li>
                        ))}
                      </ul>
                    </div>

                  </div>
                ) : (
                  <div className="text-xs text-vlink-ink-soft italic">No insights available.</div>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Footer info link */}
        <div className="bg-vlink-paper/30 p-4 text-center border-t border-vlink-line">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-vlink-trust hover:underline font-mono">
            <Home className="w-3.5 h-3.5" /> VitalLink AI Platform
          </Link>
        </div>

      </div>
    </div>
  );
}

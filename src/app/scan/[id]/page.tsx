"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  Heart, 
  PhoneCall, 
  MapPin, 
  Activity, 
  FileText, 
  Home, 
  User, 
  Briefcase,
  AlertOctagon,
  ShieldCheck,
  Check,
  Plus
} from "lucide-react";
import { supabase, isRealSupabase, decodeMockTokenToProfile } from "@/lib/supabase";

interface Profile {
  id: string;
  full_name: string;
  blood_group: string;
  date_of_birth?: string;
  address?: string;
  medical_conditions?: string;
  allergies?: string;
  current_medications?: string;
  organ_donor?: boolean;
  insurance_provider?: string;
  insurance_policy_number?: string;
  primary_doctor_name?: string;
  primary_doctor_phone?: string;
  phone?: string;
  vehicle_number?: string;
  father_mother_phone?: string;
  brother_sister_phone?: string;
  friend_phone?: string;
  government_id?: string;
}

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary: boolean;
}

export default function ScanPage() {
  const { id } = useParams() as { id: string };
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [gpsStatus, setGpsStatus] = useState("Acquiring GPS location...");
  const [alertsSent, setAlertsSent] = useState(false);

  // SOS Modal State
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [targetNumber, setTargetNumber] = useState("");
  const [targetName, setTargetName] = useState("");
  const [responderName, setResponderName] = useState("");
  const [responderMobile, setResponderMobile] = useState("");
  
  // Math puzzle state
  const [puzzleText, setPuzzleText] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [puzzleError, setPuzzleError] = useState(false);

  useEffect(() => {
    if (id) {
      loadEmergencyProfile();
    }
  }, [id]);

  const loadEmergencyProfile = async () => {
    setIsLoading(true);
    let fetchedProfile: Profile | null = null;
    let fetchedContacts: Contact[] = [];

    // 1. Check if URL contains Base64 encoded mock data
    if (id && id.startsWith("m-")) {
      const decoded = decodeMockTokenToProfile(id);
      if (decoded) {
        fetchedProfile = decoded;

        // Populate contacts from encoded fields
        if (decoded.father_mother_phone) {
          fetchedContacts.push({
            id: "c-fmp",
            name: "Father/Mother (माता / पिता)",
            relationship: "Parent",
            phone_number: decoded.father_mother_phone,
            is_primary: true
          });
        }
        if (decoded.brother_sister_phone) {
          fetchedContacts.push({
            id: "c-bsp",
            name: "Brother/Sister (भाई / बहन)",
            relationship: "Sibling",
            phone_number: decoded.brother_sister_phone,
            is_primary: false
          });
        }
        if (decoded.friend_phone) {
          fetchedContacts.push({
            id: "c-fp",
            name: "Friend (मित्र)",
            relationship: "Friend",
            phone_number: decoded.friend_phone,
            is_primary: false
          });
        }
      }
    } else {
      // 2. Fetch from Supabase or LocalStorage database
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
            
            if (contactsData) {
              fetchedContacts = contactsData.map((c: any) => ({
                id: c.id,
                name: `${c.name} (${c.relationship})`,
                relationship: c.relationship,
                phone_number: c.phone_number,
                is_primary: c.is_primary
              }));
            }
          }
        } catch (err) {
          console.error("Supabase load failed:", err);
        }
      } else {
        // LocalStorage fallback
        const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
        const mockProfiles = JSON.parse(mockProfilesStr);
        fetchedProfile = mockProfiles.find((p: any) => p.id === id) || null;

        if (fetchedProfile) {
          const mockContactsStr = localStorage.getItem("vlink_contacts") || "[]";
          const mockContacts = JSON.parse(mockContactsStr);
          const rawContacts = mockContacts.filter((c: any) => c.profile_id === id);
          fetchedContacts = rawContacts.map((c: any) => ({
            id: c.id,
            name: `${c.name} (${c.relationship})`,
            relationship: c.relationship,
            phone_number: c.phone_number,
            is_primary: c.is_primary
          }));
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
    captureLocationAndLog(fetchedProfile);
  };

  const captureLocationAndLog = (profileObj: Profile) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setGpsStatus(`GPS acquired: ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          await triggerScanEvent(profileObj, lat, lng);
        },
        async (err) => {
          setGpsStatus("GPS permission denied. Logging scan without coordinates.");
          await triggerScanEvent(profileObj);
        }
      );
    } else {
      setGpsStatus("GPS tracking not supported. Logging scan.");
      triggerScanEvent(profileObj);
    }
  };

  const triggerScanEvent = async (profileObj: Profile, lat?: number, lng?: number) => {
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
      console.error("Failed to log scan:", e);
    }
  };

  // SOS modal helper
  const openSosModal = (phone: string, name: string) => {
    setTargetNumber(phone);
    setTargetName(name);
    
    // Generate math puzzle
    const num1 = Math.floor(Math.random() * 9) + 2;
    const num2 = Math.floor(Math.random() * 8) + 2;
    setPuzzleText(`${num1} + ${num2} = ?`);
    setCorrectAnswer(num1 + num2);
    setUserAnswer("");
    setPuzzleError(false);
    
    setIsSosOpen(true);
  };

  const handleSendAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const ans = parseInt(userAnswer);
    if (ans !== correctAnswer) {
      setPuzzleError(true);
      return;
    }

    setPuzzleError(false);
    setIsSosOpen(false);
    
    // Trigger Phone Call
    window.location.href = `tel:${targetNumber}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#072421] text-white flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-white/20 border-t-vlink-pulse rounded-full animate-spin" />
        <p className="text-sm font-mono text-white/70">Accessing Emergency Profile...</p>
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="min-h-screen bg-[#072421] text-white flex flex-col items-center justify-center gap-4 p-4 text-center">
        <AlertOctagon className="w-16 h-16 text-vlink-pulse" />
        <h1 className="text-2xl font-bold font-display">Profile Not Found</h1>
        <p className="text-sm text-white/60 max-w-sm">
          The emergency QR code scanned does not exist or has been deactivated by the user.
        </p>
        <Link href="/" className="mt-4 px-6 py-2.5 bg-white text-vlink-trust-deep font-bold rounded-full text-xs">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f4f4] text-[#333] font-sans p-4 flex flex-col items-center justify-start">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-6 space-y-6">
        
        {/* Header Logo & Title */}
        <div className="text-center space-y-2">
          <svg className="w-12 h-12 mx-auto" viewBox="0 0 30 30" fill="none">
            <circle cx="15" cy="15" r="14" stroke="#1C5C53" strokeWidth="2.5" />
            <path d="M5 15h6l2-6 4 12 2-6h6" stroke="#FF5A4E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h2 className="text-xl sm:text-2xl font-black text-[#0B2521] tracking-tight">Emergency Response Assistant</h2>
          <h4 className="text-sm font-bold text-vlink-pulse tracking-wide uppercase">आपातकालीन स्थिति में संपर्क करे</h4>
        </div>

        {/* GPS location status */}
        <div className="bg-[#0B2521] text-white/90 p-3 rounded-xl text-[10px] font-mono flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-vlink-pulse" /> {gpsStatus}</span>
          {alertsSent ? (
            <span className="text-green-400 font-bold">✓ FAMILY ALERT SENT</span>
          ) : (
            <span className="text-yellow-400">LOGGING SCAN...</span>
          )}
        </div>

        {/* Dynamic Patient Info Boxes */}
        <div className="space-y-3">
          {/* 1. Name */}
          <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
            <p className="font-bold text-xs text-[#555] uppercase flex items-center gap-1.5">
              👤 Name (नाम):
            </p>
            <p className="text-base font-extrabold text-[#0B2521] mt-1">{profile.full_name}</p>
          </div>

          {/* 2. Blood Group */}
          <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
            <p className="font-bold text-xs text-[#555] uppercase flex items-center gap-1.5">
              🩸 Blood Group (ब्लड ग्रुप):
            </p>
            <p className="text-base font-extrabold text-vlink-pulse mt-1">{profile.blood_group || "Not specified"}</p>
          </div>

          {/* 3. Mobile Phone */}
          {profile.phone && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase">
                📱 Mobile (मोबाइल न.):
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-base font-mono font-bold text-[#0B2521]">{profile.phone}</span>
                <button 
                  onClick={() => openSosModal(profile.phone!, "Mobile Phone")} 
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                >
                  Call
                </button>
              </div>
            </div>
          )}

          {/* 4. Father/Mother Mobile */}
          {profile.father_mother_phone && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase">
                📞 Father/Mother's Mobile (माता / पिता के मोबाइल न.):
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-base font-mono font-bold text-[#0B2521]">{profile.father_mother_phone}</span>
                <button 
                  onClick={() => openSosModal(profile.father_mother_phone!, "Father/Mother")} 
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                >
                  Call
                </button>
              </div>
            </div>
          )}

          {/* 5. Brother/Sister Mobile */}
          {profile.brother_sister_phone && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase">
                📞 Brother/Sister's Mobile (भाई / बहन के मोबाइल न.):
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-base font-mono font-bold text-[#0B2521]">{profile.brother_sister_phone}</span>
                <button 
                  onClick={() => openSosModal(profile.brother_sister_phone!, "Brother/Sister")} 
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                >
                  Call
                </button>
              </div>
            </div>
          )}

          {/* 6. Friend Mobile */}
          {profile.friend_phone && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase">
                📞 Friend's Mobile (मित्र के मोबाइल न.):
              </p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-base font-mono font-bold text-[#0B2521]">{profile.friend_phone}</span>
                <button 
                  onClick={() => openSosModal(profile.friend_phone!, "Friend")} 
                  className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                >
                  Call
                </button>
              </div>
            </div>
          )}

          {/* 7. Vehicle Number */}
          {profile.vehicle_number && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase flex items-center gap-1.5">
                🚗 Vehicle Number (गाड़ी न.):
              </p>
              <p className="text-base font-mono font-bold text-[#0B2521] mt-1 uppercase">{profile.vehicle_number}</p>
            </div>
          )}

          {/* 8. Residential Address */}
          {profile.address && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase flex items-center gap-1.5">
                📍 Address (पता):
              </p>
              <p className="text-xs font-bold text-[#0B2521] leading-relaxed mt-1">{profile.address}</p>
            </div>
          )}

          {/* 8.5. Government ID */}
          {profile.government_id && (
            <div className="border-2 border-[#d1e42d] p-4 rounded-xl bg-[#fafafa]">
              <p className="font-bold text-xs text-[#555] uppercase flex items-center gap-1.5">
                🆔 Government ID (सरकारी दस्तावेज़ आईडी):
              </p>
              <p className="text-base font-mono font-bold text-[#0B2521] mt-1 uppercase">{profile.government_id}</p>
            </div>
          )}

          {/* 9. Clinical Allergies & Medications (Critical Extras) */}
          {(profile.allergies || profile.medical_conditions) && (
            <div className="border-2 border-[#ff5a4e] p-4 rounded-xl bg-[#fff6f5] space-y-2">
              <p className="font-bold text-xs text-vlink-pulse uppercase flex items-center gap-1.5">
                ⚠️ Critical Medical Alert:
              </p>
              {profile.allergies && (
                <div className="text-xs text-[#333]">
                  <strong className="text-vlink-pulse">Allergies:</strong> {profile.allergies}
                </div>
              )}
              {profile.medical_conditions && (
                <div className="text-xs text-[#333]">
                  <strong className="text-[#0B2521]">Conditions:</strong> {profile.medical_conditions}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Standard Emergency Services Buttons */}
        <div className="bg-[#f8f9fa] border border-vlink-line/60 rounded-xl p-4 space-y-3">
          <p className="text-[10px] text-center text-[#666] leading-relaxed font-semibold">
            आपातकालीन अलर्ट भेजने से पहले, कृपया सुनिश्चित करें कि आप सही संदेश सही प्राप्तकर्ता को भेज रहे हैं। आपकी सतर्कता और सटीकता सुनिश्चित करेगी कि सहायता सही व्यक्ति तक पहुंचे।
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 text-xs font-bold pt-2 border-t border-vlink-line/50">
            <span className="flex items-center gap-2">
              Ambulance: 
              <a href="tel:108" className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1 rounded-full uppercase">Call 108</a>
            </span>
            <span className="flex items-center gap-2">
              Police: 
              <a href="tel:100" className="bg-[#28a745] hover:bg-[#218838] text-white px-3 py-1 rounded-full uppercase">Call 100</a>
            </span>
            {profile.primary_doctor_phone && (
              <span className="flex items-center gap-2">
                Dr. Contact: 
                <a href={`tel:${profile.primary_doctor_phone}`} className="bg-[#1C5C53] hover:bg-[#0B2521] text-white px-3 py-1 rounded-full uppercase">Call</a>
              </span>
            )}
          </div>
        </div>

        {/* Buy Button */}
        <Link 
          href="/" 
          className="block w-full py-3 bg-[#28a745] hover:bg-[#218838] text-center text-white font-bold rounded-xl text-base shadow transition-colors"
        >
          Buy for Yours
        </Link>

        {/* Footer */}
        <div className="text-center text-xs text-[#6c757d] pt-2 border-t border-vlink-line/60 space-y-1">
          <p className="font-bold">Powered by VitalLink AI</p>
          <p>An Initiative by VitalLink AI</p>
        </div>

      </div>

      {/* SOS Form Puzzle Modal */}
      {isSosOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-vlink-line w-full max-w-sm p-6 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b border-vlink-line pb-2.5">
              <h3 className="font-bold text-[#dc3545] text-sm flex items-center gap-1.5">
                🚨 Send Emergency Alert (अलर्ट भेजे)
              </h3>
              <button 
                onClick={() => setIsSosOpen(false)}
                className="text-vlink-ink-soft hover:text-vlink-pulse p-1"
              >
                &times;
              </button>
            </div>

            <p className="text-[#666] leading-relaxed">
              You are about to place an emergency call to <strong>{targetName}</strong>. Please solve the puzzle below to verify your action.
            </p>

            <form onSubmit={handleSendAlert} className="space-y-4">
              <div className="space-y-1">
                <label className="font-bold text-[#333] block">Your Name (आपका नाम):</label>
                <input
                  type="text"
                  required
                  value={responderName}
                  onChange={(e) => setResponderName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none bg-vlink-paper/20 focus:border-vlink-trust"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-[#333] block">Your Mobile Number (आपके मोबाइल न.):</label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a 10-digit mobile number"
                  value={responderMobile}
                  onChange={(e) => setResponderMobile(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none bg-vlink-paper/20 focus:border-vlink-trust font-mono"
                />
              </div>

              <div className="space-y-1 bg-vlink-paper/40 p-3 rounded-lg border border-vlink-line flex items-center justify-between">
                <span className="font-bold text-vlink-trust-deep font-mono text-sm">{puzzleText}</span>
                <input
                  type="number"
                  required
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Result"
                  className="w-20 px-2.5 py-1 border border-vlink-line rounded-md text-center outline-none bg-white font-mono text-sm"
                />
              </div>

              {puzzleError && (
                <div className="text-red-600 font-bold bg-red-50 p-2 border border-red-200 rounded text-center">
                  Incorrect puzzle answer. Please try again.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-vlink-pulse hover:bg-[#c82333] text-white font-bold rounded-full text-xs transition-colors uppercase tracking-wider font-mono shadow-md"
              >
                Send Alert & Call (अलर्ट भेजे)
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

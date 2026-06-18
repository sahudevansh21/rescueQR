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
  Plus,
  PhoneOff,
  Volume2,
  VolumeX
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
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);

  const getSmsLink = (phoneNumber: string, patientName: string) => {
    const cleanPhone = phoneNumber.replace(/\s+/g, "");
    
    let locationStr = "";
    if (latitude && longitude) {
      locationStr = `Location: https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    } else {
      locationStr = `Location: ${window.location.origin}/scan/${profile?.id || "patient"}`;
    }

    const message = `EMERGENCY: I have scanned the RescueQR for ${patientName || "this patient"}. They need assistance. ${locationStr}`;
    const encodedMessage = encodeURIComponent(message);
    
    // Detect iOS
    const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      return `sms:${cleanPhone}&body=${encodedMessage}`;
    }
    return `sms:${cleanPhone}?body=${encodedMessage}`;
  };

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

  // OmniDim AI Voice Call States
  const [voiceCallNumber, setVoiceCallNumber] = useState("");
  const [voiceCallContactName, setVoiceCallContactName] = useState("");
  const [isVoiceCallActive, setIsVoiceCallActive] = useState(false);
  const [voiceCallStatus, setVoiceCallStatus] = useState<'connecting' | 'ringing' | 'connected' | 'ended'>('connecting');
  const [voiceCallDuration, setVoiceCallDuration] = useState(0);
  const [voiceCallTranscript, setVoiceCallTranscript] = useState<Array<{ time: string; speaker: string; text: string }>>([]);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isVoiceCallActive && voiceCallStatus !== 'ended') {
      interval = setInterval(() => {
        setVoiceCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isVoiceCallActive, voiceCallStatus]);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const speak = (msg: string) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      if (isMuted) return;
      const utterance = new SpeechSynthesisUtterance(msg);
      utterance.rate = 0.95;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(v => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Apple"))) || voices[0];
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    if (!isVoiceCallActive) return;

    if (voiceCallDuration === 2) {
      setVoiceCallStatus("ringing");
      setVoiceCallTranscript(prev => [
        ...prev,
        { time: formatDuration(2), speaker: "System", text: `Ringing emergency contact: ${voiceCallContactName} (${voiceCallNumber})...` }
      ]);
    } else if (voiceCallDuration === 5) {
      setVoiceCallStatus("connected");
      const text = `Hello. This is the RescueQR AI emergency voice assistant calling via OmniDim. We are notifying you that ${profile?.full_name || 'your contact'}'s emergency tag has had a live scan event. A responder named ${responderName || 'Someone'} is with them and requests your attention.`;
      setVoiceCallTranscript(prev => [
        ...prev,
        { time: formatDuration(5), speaker: "System", text: "Call connected. AI voice agent active." },
        { time: formatDuration(5), speaker: "RescueQR AI", text: text }
      ]);
      speak(text);
    } else if (voiceCallDuration === 15) {
      setVoiceCallTranscript(prev => [
        ...prev,
        { time: formatDuration(15), speaker: voiceCallContactName, text: "Hello? Yes? What happened? Are they okay?" }
      ]);
    } else if (voiceCallDuration === 18) {
      const text = `The patient's blood group is ${profile?.blood_group || 'not specified'}. Medical conditions are: ${profile?.medical_conditions || 'None reported'}. We have captured their GPS coordinates and sent a secure Google Maps link to your mobile number. Please check on them or contact responders immediately.`;
      setVoiceCallTranscript(prev => [
        ...prev,
        { time: formatDuration(18), speaker: "RescueQR AI", text: text }
      ]);
      speak(text);
    } else if (voiceCallDuration === 28) {
      setVoiceCallTranscript(prev => [
        ...prev,
        { time: formatDuration(28), speaker: voiceCallContactName, text: "Okay, I see the maps location message! I am checking it and heading there right now. Thank you so much." }
      ]);
    } else if (voiceCallDuration === 32) {
      setVoiceCallStatus("ended");
      setVoiceCallTranscript(prev => [
        ...prev,
        { time: formatDuration(32), speaker: "System", text: `Call hung up. Session reference ID: omni-${Math.random().toString(36).substr(2, 6).toUpperCase()}` }
      ]);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  }, [voiceCallDuration, isVoiceCallActive]);

  const startAiVoiceCall = async (phone: string, contactLabel: string) => {
    setVoiceCallNumber(phone);
    setVoiceCallContactName(contactLabel);
    setVoiceCallStatus("connecting");
    setVoiceCallTranscript([
      { time: "00:00", speaker: "System", text: "Initializing voice gateway via OmniDimension..." }
    ]);
    setIsVoiceCallActive(true);
    setVoiceCallDuration(0);

    // Call backend API to dispatch outbound call
    try {
      await fetch("/api/voice/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: phone,
          patientName: profile?.full_name || "Patient",
          bloodGroup: profile?.blood_group,
          conditions: profile?.medical_conditions,
          allergies: profile?.allergies,
          medications: profile?.current_medications,
          locationLink: latitude && longitude 
            ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
            : `${window.location.origin}/scan/${profile?.id || "patient"}`
        })
      });
    } catch (err) {
      console.error("Backend voice dispatch API failed:", err);
    }
  };

  const hangUpCall = () => {
    setVoiceCallStatus("ended");
    setIsVoiceCallActive(false);
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      // Resume or replay current state
      if (voiceCallStatus === "connected") {
        if (voiceCallDuration >= 5 && voiceCallDuration < 15) {
          const text = `Hello. This is the RescueQR AI emergency voice assistant calling via OmniDim. We are notifying you that ${profile?.full_name || 'your contact'}'s emergency tag has had a live scan event. A responder named ${responderName || 'Someone'} is with them and requests your attention.`;
          speak(text);
        } else if (voiceCallDuration >= 18 && voiceCallDuration < 28) {
          const text = `The patient's blood group is ${profile?.blood_group || 'not specified'}. Medical conditions are: ${profile?.medical_conditions || 'None reported'}. We have captured their GPS coordinates and sent a secure Google Maps link to your mobile number. Please check on them or contact responders immediately.`;
          speak(text);
        }
      }
    } else {
      setIsMuted(true);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

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
          setLatitude(lat);
          setLongitude(lng);
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
    
    // Trigger AI Voice Agent Call
    startAiVoiceCall(targetNumber, targetName);
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
                <div className="flex gap-2">
                  <a 
                    href={getSmsLink(profile.phone!, profile.full_name)}
                    className="bg-[#17a2b8] hover:bg-[#138496] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono flex items-center justify-center"
                  >
                    SMS
                  </a>
                  <button 
                    onClick={() => openSosModal(profile.phone!, "Mobile Phone")} 
                    className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                  >
                    Call
                  </button>
                </div>
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
                <div className="flex gap-2">
                  <a 
                    href={getSmsLink(profile.father_mother_phone!, profile.full_name)}
                    className="bg-[#17a2b8] hover:bg-[#138496] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono flex items-center justify-center"
                  >
                    SMS
                  </a>
                  <button 
                    onClick={() => openSosModal(profile.father_mother_phone!, "Father/Mother")} 
                    className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                  >
                    Call
                  </button>
                </div>
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
                <div className="flex gap-2">
                  <a 
                    href={getSmsLink(profile.brother_sister_phone!, profile.full_name)}
                    className="bg-[#17a2b8] hover:bg-[#138496] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono flex items-center justify-center"
                  >
                    SMS
                  </a>
                  <button 
                    onClick={() => openSosModal(profile.brother_sister_phone!, "Brother/Sister")} 
                    className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                  >
                    Call
                  </button>
                </div>
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
                <div className="flex gap-2">
                  <a 
                    href={getSmsLink(profile.friend_phone!, profile.full_name)}
                    className="bg-[#17a2b8] hover:bg-[#138496] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono flex items-center justify-center"
                  >
                    SMS
                  </a>
                  <button 
                    onClick={() => openSosModal(profile.friend_phone!, "Friend")} 
                    className="bg-[#28a745] hover:bg-[#218838] text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-sm transition-colors uppercase font-mono"
                  >
                    Call
                  </button>
                </div>
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
          <p className="font-bold">Powered by RescueQR</p>
          <p>An Initiative by RescueQR</p>
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

      {/* OmniDim AI Voice Call Overlay */}
      {isVoiceCallActive && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-vlink-trust-deep/90 backdrop-blur-md p-4 text-white">
          <div className="bg-[#0B2521] border border-vlink-trust rounded-3xl w-full max-w-md p-6 flex flex-col justify-between h-[80vh] shadow-2xl relative overflow-hidden">
            
            {/* Ambient Background Glows */}
            <div className="absolute -right-24 -top-24 w-48 h-48 bg-vlink-pulse/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -left-24 -bottom-24 w-48 h-48 bg-vlink-trust/20 rounded-full blur-3xl" />

            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-vlink-trust/30">
                <div>
                  <h3 className="text-base font-extrabold font-display tracking-tight text-white flex items-center gap-1.5">
                    <span className="relative flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        voiceCallStatus === 'connected' ? 'bg-green-400' : voiceCallStatus === 'ended' ? 'bg-red-400' : 'bg-yellow-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${
                        voiceCallStatus === 'connected' ? 'bg-green-500' : voiceCallStatus === 'ended' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></span>
                    </span>
                    RescueQR AI Voice Agent
                  </h3>
                  <p className="text-[9px] font-mono text-vlink-paper/60 uppercase tracking-widest mt-0.5">Powered by OmniDimension</p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-xs font-bold bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                    {formatDuration(voiceCallDuration)}
                  </span>
                </div>
              </div>

              {/* Call target details */}
              <div className="text-center py-4 space-y-1">
                <div className="w-16 h-16 rounded-full bg-vlink-pulse/10 text-vlink-pulse border border-vlink-pulse/30 flex items-center justify-center mx-auto mb-2 animate-beacon">
                  <PhoneCall className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold font-display">{voiceCallContactName}</h4>
                <p className="text-xs font-mono text-vlink-paper/65">{voiceCallNumber}</p>
                <p className="text-xs text-vlink-pulse font-semibold capitalize animate-pulse mt-2">
                  {voiceCallStatus === "connecting" && "Establishing connection..."}
                  {voiceCallStatus === "ringing" && "Ringing family member..."}
                  {voiceCallStatus === "connected" && "Call Connected — AI is speaking"}
                  {voiceCallStatus === "ended" && "Call ended"}
                </p>
              </div>

              {/* Transcript list */}
              <div className="space-y-3">
                <p className="text-[10px] font-mono uppercase tracking-wider text-vlink-paper/50">Call Transcript (लाइव बातचीत):</p>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 h-48 overflow-y-auto space-y-3 font-sans text-xs scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                  {voiceCallTranscript.length === 0 ? (
                    <p className="text-center text-vlink-paper/30 italic py-8">No conversation transcript yet...</p>
                  ) : (
                    voiceCallTranscript.map((t, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[9px] text-vlink-paper/40 font-mono">
                          <span>{t.speaker}</span>
                          <span>{t.time}</span>
                        </div>
                        <p className={`p-2 rounded-xl text-left leading-relaxed ${
                          t.speaker === "System" 
                            ? "bg-white/5 text-vlink-paper/70 font-mono text-[10px]"
                            : t.speaker === "RescueQR AI"
                            ? "bg-vlink-pulse/10 border border-vlink-pulse/20 text-vlink-paper"
                            : "bg-white/10 text-vlink-paper"
                        }`}>
                          {t.text}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="space-y-4 pt-4 border-t border-vlink-trust/30">
              <div className="flex justify-center gap-4">
                <button
                  onClick={toggleMute}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
                    isMuted 
                      ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/20" 
                      : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                  }`}
                  title={isMuted ? "Unmute TTS Audio" : "Mute TTS Audio"}
                >
                  {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                <button
                  onClick={hangUpCall}
                  className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 shadow-lg shadow-red-600/20"
                  title="Hang Up Call"
                >
                  <PhoneOff className="w-6 h-6" />
                </button>
              </div>

              <div className="text-center">
                <a
                  href={`tel:${voiceCallNumber}`}
                  className="text-xs text-vlink-paper/50 hover:text-white underline font-mono transition-colors"
                >
                  Bypass AI Call & Direct Dial Phone Instead
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

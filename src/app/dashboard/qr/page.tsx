"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
import { 
  Download, 
  Printer, 
  CreditCard, 
  Tag, 
  Activity, 
  Sparkles,
  ShieldCheck,
  Smartphone,
  Heart
} from "lucide-react";
import { isRealSupabase, encodeProfileToMockToken, supabase } from "@/lib/supabase";

export default function QRManagementPage() {
  const [profileId, setProfileId] = useState("");
  const [profileName, setProfileName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [doctorPhone, setDoctorPhone] = useState("");
  const [qrPngUrl, setQrPngUrl] = useState("");
  const [qrSvgString, setQrSvgString] = useState("");
  const [scanUrl, setScanUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeTemplate, setActiveTemplate] = useState<"card" | "sticker" | "wristband">("card");

  useEffect(() => {
    loadProfileAndGenerateQR();
  }, []);

  const loadProfileAndGenerateQR = async () => {
    setIsLoading(true);
    const uid = localStorage.getItem("vlink_uid") || "aanya-verma";
    setProfileId(uid);

    let name = "Aanya Verma";
    let blood = "O+";
    let phone = "+91 98888 77777";
    let profileObj: any = null;
    let contactsList: any[] = [];

    if (isRealSupabase) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle();
        
        if (profile) {
          profileObj = profile;
          name = profile.full_name || "Aanya Verma";
          blood = profile.blood_group || "O+";
          phone = profile.primary_doctor_phone || "+91 98888 77777";
        }

        const { data: contactsData } = await supabase
          .from("emergency_contacts")
          .select("*")
          .eq("profile_id", uid);
        contactsList = contactsData || [];
      } catch (err) {
        console.error("Supabase load failed:", err);
      }
    } else {
      // LocalStorage Load
      const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
      const mockProfiles = JSON.parse(mockProfilesStr);
      const profile = mockProfiles.find((p: any) => p.id === uid);
      
      if (profile) {
        profileObj = profile;
        name = profile.full_name || "Aanya Verma";
        blood = profile.blood_group || "O+";
        phone = profile.primary_doctor_phone || "+91 98888 77777";
      }

      const mockContactsStr = localStorage.getItem("vlink_contacts") || "[]";
      const mockContacts = JSON.parse(mockContactsStr);
      contactsList = mockContacts.filter((c: any) => c.profile_id === uid);
    }
    
    setProfileName(name);
    setBloodGroup(blood);
    setDoctorPhone(phone);

    // Construct public responder scan URL
    let url = "";
    if (isRealSupabase) {
      url = `${window.location.origin}/scan/${uid}`;
    } else {
      // Generate a dynamic self-contained token representing all the details
      url = `${window.location.origin}/scan/${encodeProfileToMockToken(profileObj || { id: uid, full_name: name, blood_group: blood, primary_doctor_phone: phone }, contactsList)}`;
    }
    setScanUrl(url);

    try {
      // Generate Base64 PNG QR code
      const pngDataUrl = await QRCode.toDataURL(url, {
        width: 600,
        margin: 2,
        color: {
          dark: "#11332D", // vlink-trust-deep
          light: "#FFFFFF"
        }
      });
      setQrPngUrl(pngDataUrl);

      // Generate raw SVG code
      const svgText = await QRCode.toString(url, {
        type: "svg",
        margin: 2,
        color: {
          dark: "#11332D",
          light: "#FFFFFF"
        }
      });
      setQrSvgString(svgText);
    } catch (err) {
      console.error("QR Generation failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadPNG = () => {
    if (!qrPngUrl) return;
    const a = document.createElement("a");
    a.href = qrPngUrl;
    a.download = `rescueqr-qr-${profileId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadSVG = () => {
    if (!qrSvgString) return;
    const blob = new Blob([qrSvgString], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rescueqr-qr-${profileId}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-vlink-trust border-t-vlink-pulse rounded-full animate-spin" />
        <p className="text-sm font-mono text-vlink-ink-soft">Generating secure QR code...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center border border-vlink-line">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-vlink-trust-deep font-display">QR Code Management</h1>
          <p className="text-sm text-vlink-ink-soft">
            Download or print your unique emergency identifier. Responders scan this to access your profile.
          </p>
        </div>
        
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-3 bg-vlink-trust-deep hover:bg-vlink-trust text-white font-bold rounded-full text-sm shadow transition-colors no-print"
        >
          <Printer className="w-4.5 h-4.5" /> Print Tag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left pane: Download & Actions */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 border border-vlink-line rounded-3xl space-y-6 no-print">
          <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3">Your Unique QR Code</h3>
          
          <div className="bg-vlink-paper/40 p-6 rounded-2xl border border-vlink-line flex flex-col items-center justify-center">
            {qrPngUrl && (
              <img 
                src={qrPngUrl} 
                alt="Emergency QR Code" 
                className="w-48 h-48 bg-white p-3 rounded-2xl border border-vlink-line shadow-sm"
              />
            )}
            <span className="text-[10px] font-mono text-vlink-ink-soft mt-3 text-center break-all">
              {scanUrl}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={downloadPNG}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-vlink-line hover:border-vlink-trust rounded-full text-xs font-bold text-vlink-trust-deep transition-all"
            >
              <Download className="w-4 h-4 text-vlink-pulse" /> Download PNG
            </button>
            
            <button
              onClick={downloadSVG}
              className="flex items-center justify-center gap-2 py-3 px-4 border border-vlink-line hover:border-vlink-trust rounded-full text-xs font-bold text-vlink-trust-deep transition-all"
            >
              <Download className="w-4 h-4 text-vlink-pulse" /> Download SVG
            </button>
          </div>

          <hr className="border-vlink-line/60" />

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-vlink-trust-deep font-mono uppercase tracking-wider">How to use your QR:</h4>
            <div className="space-y-3 text-xs text-vlink-ink-soft">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-vlink-trust/10 text-vlink-trust flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">1</div>
                <p>**Print the Emergency Wallet Card** and place it in your purse or wallet behind your ID.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-vlink-trust/10 text-vlink-trust flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">2</div>
                <p>**Print stickers** to place on your motorcycle helmet, car dashboard, or children's schoolbags.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-vlink-trust/10 text-vlink-trust flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">3</div>
                <p>**Create a lockscreen wallpaper** using the downloaded PNG to show on your phone when locked.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right pane: Printable Previews */}
        <div className="lg:col-span-7 space-y-6">
          {/* Tabs */}
          <div className="flex gap-2 justify-start border-b border-vlink-line pb-px no-print">
            {[
              { id: "card", label: "Wallet Card", icon: CreditCard },
              { id: "sticker", label: "Sticker Sheet", icon: Tag },
              { id: "wristband", label: "Wristband strip", icon: Activity }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTemplate(t.id as any)}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold border-b-2 transition-all ${
                  activeTemplate === t.id
                    ? "border-vlink-pulse text-vlink-pulse font-bold"
                    : "border-transparent text-vlink-ink-soft hover:text-vlink-trust-deep"
                }`}
              >
                <t.icon className="w-4.5 h-4.5" />
                {t.label}
              </button>
            ))}
          </div>

          {/* Template Previews */}
          <div className="bg-white p-8 border border-vlink-line rounded-3xl flex justify-center shadow-sm relative">
            
            {/* Template 1: Emergency Wallet Card */}
            {activeTemplate === "card" && (
              <div className="w-[3.375in] h-[2.125in] border-2 border-vlink-trust-deep rounded-2xl p-4 flex flex-col justify-between bg-white relative print-card text-vlink-trust-deep shadow-md">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-[14px] font-extrabold font-display leading-none">RescueQR</h4>
                    <span className="text-[7px] font-mono tracking-widest text-vlink-pulse block mt-0.5 uppercase">EMERGENCY DATA TAG</span>
                  </div>
                  <Heart className="w-4 h-4 text-vlink-pulse fill-vlink-pulse" />
                </div>

                <div className="flex gap-3 items-center my-2">
                  {qrPngUrl && (
                    <img src={qrPngUrl} className="w-14 h-14 bg-white border border-vlink-line p-0.5 rounded" alt="QR" />
                  )}
                  <div className="space-y-0.5">
                    <span className="text-[12px] font-bold block leading-none">{profileName}</span>
                    <span className="text-[8px] block text-vlink-ink-soft">Blood Group: <strong className="text-vlink-pulse">{bloodGroup}</strong></span>
                    <span className="text-[7px] font-mono block text-vlink-ink-soft">ID: {profileId}</span>
                  </div>
                </div>

                <div className="border-t border-vlink-line/80 pt-1.5 flex justify-between items-center text-[7px] font-mono">
                  <span>SCAN FOR CLINICAL DATA / MEDICATIONS</span>
                  <span className="font-bold">Contact: {doctorPhone}</span>
                </div>
              </div>
            )}

            {/* Template 2: Emergency Sticker Layout */}
            {activeTemplate === "sticker" && (
              <div className="flex flex-col gap-4 items-center">
                <span className="text-xs text-vlink-ink-soft font-mono no-print">Standard 2.5\" Round / Square Stickers</span>
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="w-32 h-32 border border-vlink-pulse rounded-2xl p-3 flex flex-col items-center justify-between text-center bg-white shadow-sm">
                      <span className="text-[7px] font-extrabold uppercase font-mono tracking-wide text-vlink-pulse leading-none">RescueQR Emergency ID</span>
                      {qrPngUrl && (
                        <img src={qrPngUrl} className="w-16 h-16 border border-vlink-line p-0.5 rounded" alt="QR" />
                      )}
                      <span className="text-[7px] font-mono text-vlink-trust-deep font-bold">SCAN ME FOR VITAL DATA</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Template 3: Emergency Wristband */}
            {activeTemplate === "wristband" && (
              <div className="w-full flex flex-col items-center gap-4">
                <span className="text-xs text-vlink-ink-soft font-mono no-print">Printed Loop Strip (fits 7-8 inch wrists)</span>
                <div className="w-full max-w-md h-8 border border-vlink-trust-deep rounded bg-white flex justify-between items-center px-4 font-mono text-[9px] relative shadow-sm">
                  <span className="font-bold">RESCUEQR</span>
                  <span className="text-vlink-pulse font-bold">❤️ EMERGENCY MEDICAL TAG</span>
                  <div className="flex items-center gap-2">
                    <span>SCAN IN CRISIS</span>
                    {qrPngUrl && (
                      <img src={qrPngUrl} className="w-6 h-6 border border-vlink-line bg-white" alt="QR" />
                    )}
                  </div>
                  <div className="absolute right-0 top-0 bottom-0 w-8 border-l border-vlink-line flex items-center justify-center text-[7px] rotate-90 text-vlink-ink-soft bg-vlink-paper/40">
                    GLUE
                  </div>
                </div>
              </div>
            )}

            {/* Printable version that shows when window.print() is executed */}
            <div className="hidden print-only absolute inset-0 bg-white z-50 flex-col items-center justify-center p-8">
              <div className="space-y-8 text-center">
                <h2 className="text-xl font-bold font-display text-vlink-trust-deep">RescueQR Printable Emergency Identifiers</h2>
                
                <div className="flex flex-col items-center gap-8 border-2 border-dashed border-vlink-line p-8 rounded-3xl">
                  {/* Card Print */}
                  <div className="w-[3.375in] h-[2.125in] border-2 border-black rounded-2xl p-4 flex flex-col justify-between bg-white text-black text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold leading-none">RescueQR</h4>
                        <span className="text-[8px] font-mono tracking-widest text-red-600 block mt-0.5 uppercase">EMERGENCY DATA TAG</span>
                      </div>
                      <span className="text-lg">❤️</span>
                    </div>

                    <div className="flex gap-3 items-center my-2">
                      {qrPngUrl && (
                        <img src={qrPngUrl} className="w-16 h-16 bg-white border border-gray-300 p-0.5 rounded" alt="QR" />
                      )}
                      <div className="space-y-0.5">
                        <span className="text-sm font-bold block leading-none">{profileName}</span>
                        <span className="text-[9px] block">Blood Group: <strong>{bloodGroup}</strong></span>
                        <span className="text-[8px] font-mono block text-gray-500">ID: {profileId}</span>
                      </div>
                    </div>

                    <div className="border-t border-gray-300 pt-1.5 flex justify-between items-center text-[7px] font-mono">
                      <span>SCAN FOR CLINICAL DATA / MEDICATIONS</span>
                      <span className="font-bold">Contact: {doctorPhone}</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-xs font-mono text-gray-500 max-w-md">
                  Cut out the card above and place it in your wallet. Carry it with you at all times.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

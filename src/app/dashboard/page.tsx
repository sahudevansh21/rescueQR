"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Scan, 
  MapPin, 
  Activity, 
  Sparkles, 
  Smartphone, 
  ShieldAlert,
  User,
  QrCode,
  Heart,
  Plus,
  Play,
  ArrowRight
} from "lucide-react";
import { supabase, isRealSupabase } from "@/lib/supabase";

interface ScanLog {
  id: string;
  profile_id?: string;
  scanned_at: string;
  latitude?: number;
  longitude?: number;
  ip_address?: string;
  user_agent?: string;
  location_name?: string;
}

export default function UserDashboard() {
  const [profileName, setProfileName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [prepScore, setPrepScore] = useState(0);
  const [scansCount, setScansCount] = useState(0);
  const [contactsCount, setContactsCount] = useState(0);
  const [scanLogs, setScanLogs] = useState<ScanLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    const uid = localStorage.getItem("vlink_uid") || "aanya-verma";

    let name = "Aanya Verma";
    let blood = "O+";
    let score = 80;
    let sCount = 1;
    let cCount = 2;
    let logs: ScanLog[] = [];

    if (isRealSupabase) {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle();

        if (profile) {
          name = profile.full_name || "Aanya Verma";
          blood = profile.blood_group || "";
          
          // Calculate score
          let calculated = 0;
          if (profile.full_name) calculated += 10;
          if (profile.blood_group) calculated += 10;
          if (profile.date_of_birth) calculated += 10;
          if (profile.address) calculated += 10;
          if (profile.medical_conditions) calculated += 10;
          if (profile.allergies) calculated += 10;
          if (profile.current_medications) calculated += 10;
          if (profile.insurance_provider) calculated += 10;
          if (profile.primary_doctor_name) calculated += 10;
          score = calculated;
        }

        const { data: contactsData } = await supabase
          .from("emergency_contacts")
          .select("id")
          .eq("profile_id", uid);
        cCount = contactsData?.length || 0;

        const { data: scansData } = await supabase
          .from("scan_logs")
          .select("*")
          .eq("profile_id", uid)
          .order("scanned_at", { ascending: false });
        
        logs = scansData || [];
        sCount = logs.length;

      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    } else {
      // Mock Dashboard Load
      const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
      const mockProfiles = JSON.parse(mockProfilesStr);
      let profile = mockProfiles.find((p: any) => p.id === uid);

      if (!profile && uid === "aanya-verma") {
        profile = {
          full_name: "Aanya Verma",
          blood_group: "O+",
          medical_conditions: "Type 1 diabetes",
          allergies: "Penicillin",
          date_of_birth: "1995",
          address: "Bengaluru",
          primary_doctor_name: "Dr. Nair",
          insurance_provider: "Care"
        };
      }

      if (profile) {
        name = profile.full_name || "Aanya Verma";
        blood = profile.blood_group || "";
        
        let calculated = 10; // base name
        if (profile.blood_group) calculated += 10;
        if (profile.date_of_birth) calculated += 10;
        if (profile.address) calculated += 10;
        if (profile.medical_conditions) calculated += 10;
        if (profile.allergies) calculated += 10;
        if (profile.current_medications) calculated += 10;
        if (profile.insurance_provider) calculated += 10;
        if (profile.primary_doctor_name) calculated += 10;
        score = calculated;
      }

      const mockContactsStr = localStorage.getItem("vlink_contacts") || "[]";
      const mockContacts = JSON.parse(mockContactsStr);
      cCount = mockContacts.filter((c: any) => c.profile_id === uid).length;
      
      // Default contacts count seed
      if (cCount === 0 && uid === "aanya-verma") cCount = 2;

      const mockScansStr = localStorage.getItem("vlink_scans") || "[]";
      const mockScans = JSON.parse(mockScansStr);
      logs = mockScans
        .filter((s: any) => s.profile_id === uid)
        .sort((a: any, b: any) => new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime());
      
      sCount = logs.length;
      if (sCount === 0 && uid === "aanya-verma") {
        logs = [{
          id: 's1',
          profile_id: 'aanya-verma',
          scanned_at: new Date(Date.now() - 3600000).toISOString(),
          latitude: 12.9716,
          longitude: 77.5946,
          location_name: "Near Cubbon Park, Bengaluru",
          ip_address: "103.241.12.9",
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
        }];
        sCount = 1;
        // save to store
        localStorage.setItem("vlink_scans", JSON.stringify(logs));
      }
    }

    setProfileName(name);
    setBloodGroup(blood);
    setPrepScore(score);
    setContactsCount(cCount);
    setScansCount(sCount);
    setScanLogs(logs);
    setIsLoading(false);
  };

  // Simulation handler
  const handleSimulateScan = async () => {
    setIsSimulating(true);
    const uid = localStorage.getItem("vlink_uid") || "aanya-verma";

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profile_id: uid,
          latitude: 12.9716 + (Math.random() - 0.5) * 0.05,
          longitude: 77.5946 + (Math.random() - 0.5) * 0.05,
          user_agent: "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X)"
        })
      });

      if (res.ok) {
        // Reload dashboard
        await new Promise(resolve => setTimeout(resolve, 800));
        loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-vlink-trust border-t-vlink-pulse rounded-full animate-spin" />
        <p className="text-sm font-mono text-vlink-ink-soft">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-vlink-trust-deep to-vlink-trust text-white p-6 sm:p-8 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-vlink-trust shadow-lg">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold font-display leading-tight">Welcome, {profileName}!</h1>
          <p className="text-sm text-vlink-paper/80">
            Your emergency identification profile is active. First responders can access your medical details.
          </p>
        </div>
        
        {/* Simulation Action */}
        <button
          onClick={handleSimulateScan}
          disabled={isSimulating}
          className="inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-vlink-pulse hover:bg-vlink-pulse/90 disabled:opacity-50 text-white font-bold rounded-full text-xs shadow-md border border-white/20 transition-all uppercase tracking-wider font-mono"
        >
          <Play className="w-4 h-4 fill-white" /> 
          {isSimulating ? "Dispatching Alerts..." : "Simulate QR Scan"}
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vlink-pulse/10 text-vlink-pulse flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-vlink-ink-soft block font-mono uppercase tracking-wider">Preparedness</span>
            <span className="text-xl font-black text-vlink-trust-deep font-display">{prepScore}% Complete</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vlink-trust/10 text-vlink-trust flex items-center justify-center flex-shrink-0">
            <Scan className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-vlink-ink-soft block font-mono uppercase tracking-wider">Emergency Scans</span>
            <span className="text-xl font-black text-vlink-trust-deep font-display">{scansCount} Logs</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-vlink-trust/10 text-vlink-trust flex items-center justify-center flex-shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-vlink-ink-soft block font-mono uppercase tracking-wider">Contacts Added</span>
            <span className="text-xl font-black text-vlink-trust-deep font-display">{contactsCount} Contacts</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Quick Links Grid */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-vlink-line space-y-6 shadow-sm">
          <h3 className="text-md font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3">Quick Navigation</h3>
          
          <div className="grid grid-cols-1 gap-3 text-xs">
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-between p-4 bg-vlink-paper/30 border border-vlink-line hover:border-vlink-trust rounded-2xl transition-all font-semibold text-vlink-trust-deep group"
            >
              <span className="flex items-center gap-2"><User className="w-4.5 h-4.5 text-vlink-trust" /> Edit Medical Profile</span>
              <ArrowRight className="w-4 h-4 text-vlink-ink-soft group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/dashboard/qr"
              className="flex items-center justify-between p-4 bg-vlink-paper/30 border border-vlink-line hover:border-vlink-trust rounded-2xl transition-all font-semibold text-vlink-trust-deep group"
            >
              <span className="flex items-center gap-2"><QrCode className="w-4.5 h-4.5 text-vlink-trust" /> Print / Download QR</span>
              <ArrowRight className="w-4 h-4 text-vlink-ink-soft group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              href="/pricing"
              className="flex items-center justify-between p-4 bg-vlink-paper/30 border border-vlink-line hover:border-vlink-trust rounded-2xl transition-all font-semibold text-vlink-trust-deep group"
            >
              <span className="flex items-center gap-2"><Sparkles className="w-4.5 h-4.5 text-vlink-pulse" /> Upgrade to Premium</span>
              <ArrowRight className="w-4 h-4 text-vlink-ink-soft group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-vlink-line space-y-6 shadow-sm">
          <div className="flex justify-between items-center border-b border-vlink-line pb-3">
            <h3 className="text-md font-bold text-vlink-trust-deep font-display flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-vlink-pulse" /> Live Scan Activity
            </h3>
            <span className="text-[10px] font-mono font-bold text-vlink-success uppercase bg-green-50 px-2.5 py-1 border border-green-200 rounded-full">Real-time sync</span>
          </div>

          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-1">
            {scanLogs.length === 0 ? (
              <div className="text-xs text-vlink-ink-soft bg-vlink-paper/30 p-8 border border-dashed border-vlink-line rounded-2xl text-center">
                No scan activity logged yet. Click **Simulate QR Scan** above to test notifications and location mapping.
              </div>
            ) : (
              scanLogs.map((log) => {
                const date = new Date(log.scanned_at).toLocaleString();
                const isMobile = log.user_agent?.toLowerCase().includes("iphone") || log.user_agent?.toLowerCase().includes("android");
                
                return (
                  <div key={log.id} className="p-4 bg-vlink-paper/20 border border-vlink-line rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-vlink-pulse animate-ping" />
                        <span className="text-xs font-bold text-vlink-trust-deep">{log.location_name || "Emergency scan log recorded"}</span>
                      </div>
                      <div className="text-[10px] text-vlink-ink-soft font-mono flex flex-wrap gap-x-3 gap-y-1">
                        <span>Timestamp: {date}</span>
                        <span>IP Address: {log.ip_address || "127.0.0.1"}</span>
                        <span>Device: {isMobile ? "Mobile Phone" : "Desktop browser"}</span>
                      </div>
                    </div>

                    {log.latitude && log.longitude && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${log.latitude},${log.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-vlink-line hover:border-vlink-trust rounded-full text-xs font-bold text-vlink-trust-deep bg-white shadow-sm transition-all"
                      >
                        <MapPin className="w-3.5 h-3.5 text-vlink-pulse" /> Map Link
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

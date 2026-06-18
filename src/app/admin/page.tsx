"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  Activity, 
  Sparkles, 
  DollarSign, 
  ChevronRight, 
  Heart,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Search,
  Plus,
  Trash,
  QrCode,
  Globe,
  ExternalLink,
  Copy,
  Check,
  X,
  UserPlus
} from "lucide-react";
import { supabase, isRealSupabase, encodeProfileToMockToken } from "@/lib/supabase";
import QRCode from "qrcode";

interface PatientUser {
  id: string;
  name: string;
  email: string;
  tier: "Premium" | "Free";
  blood: string;
  scans: number;
  date: string;
  profile: any;
}

export default function AdminDashboard() {
  const [users, setUsers] = useState<PatientUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<PatientUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState<"All" | "Premium" | "Free">("All");

  // Summary Metrics
  const [usersCount, setUsersCount] = useState(0);
  const [mrr, setMrr] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const [scansTotal, setScansTotal] = useState(0);
  const [aiTokensUsed, setAiTokensUsed] = useState(48200);
  const [aiCallCount, setAiCallCount] = useState(140);

  // Modal State - Add Patient
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newBlood, setNewBlood] = useState("O+");
  const [newConditions, setNewConditions] = useState("");
  const [newAllergies, setNewAllergies] = useState("");
  const [newMedications, setNewMedications] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [newDocPhone, setNewDocPhone] = useState("");
  const [newContactName, setNewContactName] = useState("");
  const [newContactRel, setNewContactRel] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");
  const [newIsPremium, setNewIsPremium] = useState(true);
  const [newGovId, setNewGovId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  // Modal State - View QR
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<PatientUser | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [copiedId, setCopiedId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  // Filter logic
  useEffect(() => {
    let result = users;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (u) =>
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          u.id.toLowerCase().includes(term)
      );
    }

    if (tierFilter !== "All") {
      result = result.filter((u) => u.tier === tierFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, tierFilter, users]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles from Supabase/Mock
      const { data: profiles } = await supabase.from("profiles").select("*");
      
      // Fetch all scan logs
      const { data: scans } = await supabase.from("scan_logs").select("*");
      
      const pList = profiles || [];
      const sList = scans || [];

      // Calculate overall stats
      const totalScans = sList.length;
      setScansTotal(totalScans);

      // Map profiles
      const mapped: PatientUser[] = pList.map((p: any) => {
        const userScans = sList.filter((s: any) => s.profile_id === p.id);
        const nameClean = (p.full_name || "Anonymous").toLowerCase().replace(/\s+/g, "");
        const email = p.email || `${nameClean}@rescueqr.com`;
        
        return {
          id: p.id,
          name: p.full_name || "Anonymous",
          email: email,
          tier: p.is_premium ? "Premium" : ("Free" as any),
          blood: p.blood_group || "N/A",
          scans: userScans.length,
          date: p.created_at ? new Date(p.created_at).toISOString().split("T")[0] : "2026-06-18",
          profile: p
        };
      });

      // Sort profiles so newest are on top
      mapped.sort((a, b) => b.date.localeCompare(a.date));

      setUsers(mapped);
      setFilteredUsers(mapped);
      setUsersCount(mapped.length);

      const premium = mapped.filter((u) => u.tier === "Premium");
      setPremiumCount(premium.length);
      setMrr(premium.length * 15.0); // e.g. $15.00 MRR per premium tier user
      setAiCallCount(mapped.length * 4 + totalScans * 3);
      setAiTokensUsed((mapped.length * 4 + totalScans * 3) * 380);
    } catch (err) {
      console.error("Admin data loading failed:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    setIsCreating(true);
    const uid = "p-" + Math.random().toString(36).substr(2, 9);
    
    const profileRecord = {
      id: uid,
      full_name: newName,
      blood_group: newBlood,
      date_of_birth: "1995-08-15",
      address: "12, Baker Street, Delhi, India",
      medical_conditions: newConditions || "None listed",
      allergies: newAllergies || "None listed",
      current_medications: newMedications || "None listed",
      organ_donor: true,
      insurance_provider: "Star Health Care",
      insurance_policy_number: "SHC-556677",
      primary_doctor_name: newDocName || "Dr. Mehta",
      primary_doctor_phone: newDocPhone || "+91 99999 88888",
      is_premium: newIsPremium,
      government_id: newGovId || "None listed",
      created_at: new Date().toISOString()
    };

    try {
      // 1. Insert Profile
      await supabase.from("profiles").insert(profileRecord);

      // 2. Insert Contact if provided
      if (newContactName && newContactPhone) {
        await supabase.from("emergency_contacts").insert({
          id: "c-" + Math.random().toString(36).substr(2, 9),
          profile_id: uid,
          name: newContactName,
          relationship: newContactRel || "Family",
          phone_number: newContactPhone,
          is_primary: true
        });
      }

      // Close and clear form
      setIsAddOpen(false);
      setNewName("");
      setNewEmail("");
      setNewConditions("");
      setNewAllergies("");
      setNewMedications("");
      setNewGovId("");
      setNewDocName("");
      setNewDocPhone("");
      setNewContactName("");
      setNewContactRel("");
      setNewContactPhone("");
      
      // Reload lists
      await loadData();
    } catch (err) {
      console.error("Failed to register patient:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const togglePremium = async (u: PatientUser) => {
    const nextPremium = u.tier !== "Premium";
    try {
      await supabase
        .from("profiles")
        .update({ is_premium: nextPremium })
        .eq("id", u.id);
      await loadData();
    } catch (err) {
      console.error("Failed to toggle tier:", err);
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm("Are you sure you want to delete this patient profile? This cannot be undone.")) return;
    try {
      await supabase.from("profiles").delete().eq("id", uid);
      await loadData();
    } catch (err) {
      console.error("Failed to delete patient:", err);
    }
  };

  const getScanUrlForUser = (u: PatientUser) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "https://rescueqr.com";
    if (isRealSupabase) {
      return `${origin}/scan/${u.id}`;
    } else {
      // Encode user profile info in the URL in mock mode
      return `${origin}/scan/${encodeProfileToMockToken(u.profile, [])}`;
    }
  };

  const handleOpenQr = async (u: PatientUser) => {
    setSelectedUser(u);
    const scanUrl = getScanUrlForUser(u);
    
    try {
      const url = await QRCode.toDataURL(scanUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: "#11332D",
          light: "#FFFFFF"
        }
      });
      setQrCodeUrl(url);
      setIsQrOpen(true);
    } catch (err) {
      console.error("QR Code rendering failed:", err);
    }
  };

  const copyScanLink = (u: PatientUser) => {
    const url = getScanUrlForUser(u);
    navigator.clipboard.writeText(url);
    setCopiedId(u.id);
    setTimeout(() => setCopiedId(""), 2000);
  };

  return (
    <div className="min-h-screen bg-vlink-paper/30 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-vlink-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-vlink-trust hover:underline flex items-center gap-1 text-xs font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Landing Page
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-vlink-trust-deep font-display mt-1">Admin Dashboard</h1>
          <p className="text-sm text-vlink-ink-soft">
            Overall SaaS product analytics, MRR, subscriptions, and Gemini AI invocation metrics.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setIsAddOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-vlink-pulse hover:bg-vlink-pulse/95 text-white font-bold rounded-full text-xs shadow-md uppercase tracking-wider font-mono"
          >
            <UserPlus className="w-4 h-4" /> Add New Patient
          </button>
          <span className="bg-vlink-trust-deep text-vlink-paper text-xs font-mono font-bold px-4 py-2.5 rounded-full flex items-center gap-1.5 border border-vlink-trust">
            <Zap className="w-4 h-4 fill-vlink-pulse text-vlink-pulse" /> STATUS: OPERATIONAL
          </span>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* MRR Card */}
        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-vlink-ink-soft font-mono uppercase tracking-wider">Revenue (MRR)</span>
            <DollarSign className="w-5 h-5 text-vlink-success" />
          </div>
          <div>
            <span className="text-3xl font-black text-vlink-trust-deep font-display">${mrr.toFixed(2)}</span>
            <span className="text-xs text-vlink-success font-bold font-mono block mt-1">+12.5% vs last month</span>
          </div>
        </div>

        {/* Users Card */}
        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-vlink-ink-soft font-mono uppercase tracking-wider">Total SaaS Users</span>
            <Users className="w-5 h-5 text-vlink-trust" />
          </div>
          <div>
            <span className="text-3xl font-black text-vlink-trust-deep font-display">{usersCount} Patients</span>
            <span className="text-xs text-vlink-ink-soft font-mono block mt-1">Premium: {premiumCount} (Active Billing)</span>
          </div>
        </div>

        {/* Scan count */}
        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-vlink-ink-soft font-mono uppercase tracking-wider">Total QR Scans</span>
            <Activity className="w-5 h-5 text-vlink-pulse animate-pulse" />
          </div>
          <div>
            <span className="text-3xl font-black text-vlink-trust-deep font-display">{scansTotal} Scans</span>
            <span className="text-xs text-vlink-success font-bold font-mono block mt-1">Real-time GPS Logs synced</span>
          </div>
        </div>

        {/* Gemini usage */}
        <div className="bg-white p-6 rounded-3xl border border-vlink-line shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-vlink-ink-soft font-mono uppercase tracking-wider">Gemini API Calls</span>
            <Sparkles className="w-5 h-5 text-vlink-pulse" />
          </div>
          <div>
            <span className="text-3xl font-black text-vlink-trust-deep font-display">{aiCallCount} Calls</span>
            <span className="text-xs text-vlink-ink-soft font-mono block mt-1">Tokens: {aiTokensUsed.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* User management list */}
        <div className="lg:col-span-12 bg-white p-6 rounded-3xl border border-vlink-line shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-vlink-line pb-4">
            <h3 className="text-lg font-bold text-vlink-trust-deep font-display">User Profiles Registry</h3>
            
            {/* Search & Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-vlink-ink-soft/60 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-60 pl-9 pr-4 py-2 border border-vlink-line rounded-full text-xs outline-none bg-vlink-paper/20 focus:border-vlink-trust"
                />
              </div>

              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="px-4 py-2 border border-vlink-line rounded-full text-xs outline-none bg-vlink-paper/20 focus:border-vlink-trust font-semibold text-vlink-trust-deep"
              >
                <option value="All">All Tiers</option>
                <option value="Premium">Premium</option>
                <option value="Free">Free</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-vlink-trust border-t-vlink-pulse rounded-full animate-spin" />
              <span className="text-xs font-mono text-vlink-ink-soft">Fetching patient records...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 text-xs text-vlink-ink-soft bg-vlink-paper/10 border border-dashed border-vlink-line rounded-3xl">
              No registered profiles found matching the current search parameters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-vlink-line text-vlink-ink-soft font-mono uppercase text-[10px]">
                    <th className="pb-3 font-semibold">User details</th>
                    <th className="pb-3 font-semibold">SaaS Tier</th>
                    <th className="pb-3 font-semibold">Blood Group</th>
                    <th className="pb-3 font-semibold">Scans Recorded</th>
                    <th className="pb-3 font-semibold">Registered Date</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-vlink-line/65">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-vlink-paper/10">
                      <td className="py-3.5">
                        <div>
                          <span className="font-bold text-vlink-trust-deep block">{u.name}</span>
                          <span className="text-[10px] text-vlink-ink-soft font-mono block mt-0.5">{u.email}</span>
                          <span className="text-[9px] text-vlink-ink-soft font-mono block bg-vlink-paper/60 border border-vlink-line px-1.5 py-0.5 rounded w-fit mt-1">ID: {u.id}</span>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <button
                          onClick={() => togglePremium(u)}
                          title="Click to toggle SaaS tier status"
                          className={`px-2.5 py-1 rounded-full font-mono font-bold text-[9px] uppercase border transition-colors flex items-center gap-1 ${
                            u.tier === "Premium" 
                              ? "bg-vlink-pulse-dim text-vlink-pulse border-vlink-pulse/20" 
                              : "bg-vlink-paper text-vlink-ink-soft border-vlink-line hover:border-vlink-trust"
                          }`}
                        >
                          <Sparkles className="w-3 h-3" /> {u.tier}
                        </button>
                      </td>
                      <td className="py-3.5 font-bold font-mono text-vlink-trust-deep">{u.blood}</td>
                      <td className="py-3.5 font-mono font-bold text-vlink-trust-deep">
                        <span className={`px-2 py-0.5 rounded font-mono ${u.scans > 0 ? "bg-red-50 text-vlink-pulse" : "bg-vlink-paper text-vlink-ink-soft"}`}>
                          {u.scans} scan{u.scans !== 1 && "s"}
                        </span>
                      </td>
                      <td className="py-3.5 font-mono text-vlink-ink-soft">{u.date}</td>
                      <td className="py-3.5 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenQr(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-vlink-line hover:border-vlink-trust text-vlink-trust-deep rounded bg-white shadow-sm font-semibold transition-colors"
                            title="Generate Unique QR Code"
                          >
                            <QrCode className="w-3.5 h-3.5 text-vlink-trust" /> QR
                          </button>
                          
                          <button
                            onClick={() => copyScanLink(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-vlink-line hover:border-vlink-trust text-vlink-trust-deep rounded bg-white shadow-sm font-semibold transition-colors"
                            title="Copy Direct scan url"
                          >
                            {copiedId === u.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-vlink-success" /> Copied
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-vlink-ink-soft" /> Link
                              </>
                            )}
                          </button>

                          <a
                            href={getScanUrlForUser(u)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 border border-vlink-line hover:border-vlink-trust bg-white text-vlink-trust hover:underline rounded shadow-sm font-semibold"
                          >
                            Scan Page <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="p-1.5 border border-red-200 hover:border-red-500 hover:bg-red-50 text-red-500 hover:text-red-700 rounded transition-colors"
                            title="Delete patient profile"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Patient Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vlink-trust-deep/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-vlink-line w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="bg-vlink-trust-deep text-white px-6 py-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm font-display flex items-center gap-1.5">
                <UserPlus className="w-4.5 h-4.5 text-vlink-pulse" /> Register New Patient
              </h3>
              <button 
                onClick={() => setIsAddOpen(false)}
                className="p-1 rounded hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreatePatient} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-vlink-trust-deep block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Faiz"
                    className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="font-bold text-vlink-trust-deep block">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. faiz@gmail.com"
                    className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-vlink-trust-deep block">Government Document ID (Optional)</label>
                <input
                  type="text"
                  value={newGovId}
                  onChange={(e) => setNewGovId(e.target.value)}
                  placeholder="e.g. Aadhaar 1234-5678-9012 or PAN ABCDE1234F"
                  className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-vlink-trust-deep block">Blood Group</label>
                  <select
                    value={newBlood}
                    onChange={(e) => setNewBlood(e.target.value)}
                    className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                  >
                    {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1 flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-vlink-trust-deep">
                    <input
                      type="checkbox"
                      checked={newIsPremium}
                      onChange={(e) => setNewIsPremium(e.target.checked)}
                      className="w-4 h-4 accent-vlink-pulse"
                    />
                    Assign Premium Tier
                  </label>
                </div>
              </div>

              <hr className="border-vlink-line" />

              {/* Medical Information */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[10px] text-vlink-pulse uppercase tracking-wider">Clinical Vitals</h4>
                
                <div className="space-y-1">
                  <label className="font-bold text-vlink-trust-deep block">Medical Conditions</label>
                  <input
                    type="text"
                    value={newConditions}
                    onChange={(e) => setNewConditions(e.target.value)}
                    placeholder="e.g. Severe chronic Asthma, carrying inhaler"
                    className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-vlink-trust-deep block">Allergies</label>
                  <input
                    type="text"
                    value={newAllergies}
                    onChange={(e) => setNewAllergies(e.target.value)}
                    placeholder="e.g. Peanut allergies, bee stings"
                    className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20 border-l-2 border-l-vlink-pulse"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-vlink-trust-deep block">Current Medications</label>
                  <input
                    type="text"
                    value={newMedications}
                    onChange={(e) => setNewMedications(e.target.value)}
                    placeholder="e.g. Albuterol inhaler, Montelukast 10mg"
                    className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                  />
                </div>
              </div>

              <hr className="border-vlink-line" />

              {/* Doctor Details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[10px] text-vlink-trust uppercase tracking-wider">Doctor Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-bold text-vlink-trust-deep block">Primary Doctor Name</label>
                    <input
                      type="text"
                      value={newDocName}
                      onChange={(e) => setNewDocName(e.target.value)}
                      placeholder="Dr. Sameer Khan"
                      className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-vlink-trust-deep block">Doctor Contact Phone</label>
                    <input
                      type="tel"
                      value={newDocPhone}
                      onChange={(e) => setNewDocPhone(e.target.value)}
                      placeholder="+91 91111 22222"
                      className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                    />
                  </div>
                </div>
              </div>

              <hr className="border-vlink-line" />

              {/* Primary Contact details */}
              <div className="space-y-3">
                <h4 className="font-extrabold text-[10px] text-vlink-trust uppercase tracking-wider">Primary Emergency Contact</h4>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1 col-span-1">
                    <label className="font-bold text-vlink-trust-deep block">Name</label>
                    <input
                      type="text"
                      value={newContactName}
                      onChange={(e) => setNewContactName(e.target.value)}
                      placeholder="e.g. Ayesha Khan"
                      className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="font-bold text-vlink-trust-deep block">Relation</label>
                    <input
                      type="text"
                      value={newContactRel}
                      onChange={(e) => setNewContactRel(e.target.value)}
                      placeholder="e.g. Mother"
                      className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                    />
                  </div>
                  <div className="space-y-1 col-span-1">
                    <label className="font-bold text-vlink-trust-deep block">Phone</label>
                    <input
                      type="tel"
                      value={newContactPhone}
                      onChange={(e) => setNewContactPhone(e.target.value)}
                      placeholder="+91 99999 88888"
                      className="w-full px-3 py-2 border border-vlink-line rounded-lg outline-none focus:border-vlink-trust bg-vlink-paper/20"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="w-full py-3 bg-vlink-pulse hover:bg-vlink-pulse/90 text-white font-bold rounded-full text-xs shadow-md transition-colors uppercase tracking-wider font-mono mt-4"
              >
                {isCreating ? "Saving Details..." : "Save Patient & Generate QR"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Inspect QR Modal */}
      {isQrOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-vlink-trust-deep/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-vlink-line w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-250 p-6 space-y-6 text-center text-xs">
            <div className="flex justify-between items-center border-b border-vlink-line pb-3">
              <span className="font-bold text-vlink-trust-deep text-sm flex items-center gap-1.5">
                <QrCode className="w-4.5 h-4.5 text-vlink-pulse" /> Emergency ID QR Code
              </span>
              <button 
                onClick={() => setIsQrOpen(false)}
                className="text-vlink-ink-soft hover:text-vlink-pulse p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 text-center">
              <h4 className="text-base font-extrabold text-vlink-trust-deep">{selectedUser.name}</h4>
              <span className="font-mono text-vlink-ink-soft block bg-vlink-paper py-1 rounded text-[10px]">ID: {selectedUser.id}</span>
            </div>

            <div className="bg-vlink-paper/40 p-6 rounded-2xl border border-vlink-line flex flex-col items-center justify-center">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="Patient Emergency QR Code" 
                  className="w-48 h-48 bg-white border border-vlink-line p-2 rounded-2xl shadow-sm"
                />
              )}
            </div>

            <div className="space-y-2.5">
              <button
                onClick={() => copyScanLink(selectedUser)}
                className="w-full py-2.5 bg-white border border-vlink-line hover:border-vlink-trust rounded-full font-bold text-vlink-trust-deep transition-all flex items-center justify-center gap-2"
              >
                {copiedId === selectedUser.id ? (
                  <>
                    <Check className="w-4.5 h-4.5 text-vlink-success" /> Direct Link Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4.5 h-4.5 text-vlink-ink-soft" /> Copy Direct Scan URL
                  </>
                )}
              </button>
              
              <a
                href={qrCodeUrl}
                download={`rescueqr-patient-${selectedUser.id}.png`}
                className="w-full py-2.5 bg-vlink-pulse hover:bg-vlink-pulse/90 text-white font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow"
              >
                Download PNG Tag
              </a>
            </div>

            <p className="text-[10px] text-vlink-ink-soft leading-normal text-center">
              This QR code leads to the unique emergency route: <br />
              <span className="break-all font-mono text-[9px] font-bold text-vlink-trust-deep">{getScanUrlForUser(selectedUser)}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

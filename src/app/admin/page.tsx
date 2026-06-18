"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Users, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  DollarSign, 
  ChevronRight, 
  Heart,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { isRealSupabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const [usersCount, setUsersCount] = useState(128);
  const [mrr, setMrr] = useState(384.00);
  const [premiumCount, setPremiumCount] = useState(32);
  const [scansTotal, setScansTotal] = useState(512);
  const [aiTokensUsed, setAiTokensUsed] = useState(48200);
  const [aiCallCount, setAiCallCount] = useState(140);
  
  // Dummy users table for demonstration
  const demoUsers = [
    { id: "aanya-verma", name: "Aanya Verma", email: "aanya@verma.com", tier: "Premium", blood: "O+", scans: 14, date: "2026-06-18" },
    { id: "u2", name: "Kabir Mehta", email: "kabir@mehta.com", tier: "Premium", blood: "B-", scans: 8, date: "2026-06-17" },
    { id: "u3", name: "Pooja Roy", email: "pooja@roy.com", tier: "Free", blood: "A+", scans: 2, date: "2026-06-16" },
    { id: "u4", name: "Arjun Diwan", email: "arjun@diwan.com", tier: "Free", blood: "AB+", scans: 0, date: "2026-06-15" }
  ];

  return (
    <div className="min-h-screen bg-vlink-paper/30 p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-vlink-line pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-vlink-trust hover:underline flex items-center gap-1 text-xs font-mono">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-extrabold text-vlink-trust-deep font-display mt-1">Admin Dashboard</h1>
          <p className="text-sm text-vlink-ink-soft">
            Overall SaaS product analytics, MRR, subscriptions, and Gemini AI invocation metrics.
          </p>
        </div>
        
        <span className="bg-vlink-pulse text-white text-xs font-mono font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
          <Zap className="w-4 h-4 fill-white" /> SYSTEM STATUS: OPERATIONAL
        </span>
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
            <span className="text-3xl font-black text-vlink-trust-deep font-display">{usersCount} Users</span>
            <span className="text-xs text-vlink-ink-soft font-mono block mt-1">Premium: {premiumCount} (25% Conversion)</span>
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
            <span className="text-xs text-vlink-success font-bold font-mono block mt-1">+85 scans logged today</span>
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
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-vlink-line shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3">User Profiles Directory</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-vlink-line text-vlink-ink-soft font-mono uppercase text-[10px]">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Tier</th>
                  <th className="pb-3 font-semibold">Blood Group</th>
                  <th className="pb-3 font-semibold">Total Scans</th>
                  <th className="pb-3 font-semibold">Created Date</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-vlink-line/65">
                {demoUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-vlink-paper/10">
                    <td className="py-3.5">
                      <div>
                        <span className="font-bold text-vlink-trust-deep block">{u.name}</span>
                        <span className="text-[10px] text-vlink-ink-soft font-mono">{u.email}</span>
                      </div>
                    </td>
                    <td className="py-3.5">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase ${
                        u.tier === "Premium" 
                          ? "bg-vlink-pulse-dim text-vlink-pulse" 
                          : "bg-vlink-paper text-vlink-ink-soft"
                      }`}>
                        {u.tier}
                      </span>
                    </td>
                    <td className="py-3.5 font-bold font-mono text-vlink-trust-deep">{u.blood}</td>
                    <td className="py-3.5 font-mono">{u.scans} scans</td>
                    <td className="py-3.5 font-mono text-vlink-ink-soft">{u.date}</td>
                    <td className="py-3.5 text-right">
                      <Link
                        href={`/scan/${u.id}`}
                        target="_blank"
                        className="inline-flex items-center gap-0.5 text-vlink-trust hover:underline font-semibold"
                      >
                        Scan View <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Analytics sidebar */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-vlink-line space-y-6 shadow-sm">
          <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3">AI Engine Analytics</h3>

          {/* Model distribution */}
          <div className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-vlink-ink-soft font-semibold">
                <span>gemini-2.5-flash</span>
                <span>100%</span>
              </div>
              <div className="w-full bg-vlink-paper rounded-full h-2 overflow-hidden">
                <div className="bg-vlink-pulse h-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-vlink-ink-soft font-semibold">
                <span>gemini-2.5-pro</span>
                <span>0%</span>
              </div>
              <div className="w-full bg-vlink-paper rounded-full h-2 overflow-hidden">
                <div className="bg-vlink-pulse h-full" style={{ width: '0%' }} />
              </div>
            </div>

            <hr className="border-vlink-line/60" />

            {/* Token details */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-vlink-ink-soft font-mono">Average Response Latency:</span>
                <span className="font-bold text-vlink-trust-deep font-mono">0.62s</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-vlink-ink-soft font-mono">Estimated Gemini Cost:</span>
                <span className="font-bold text-vlink-trust-deep font-mono">$0.00364</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-vlink-ink-soft font-mono">Real-time alerts sent:</span>
                <span className="font-bold text-vlink-trust-deep font-mono">152 SMS</span>
              </div>
            </div>

            <hr className="border-vlink-line/60" />

            <div className="p-4 bg-vlink-paper/50 rounded-2xl border border-vlink-line space-y-2">
              <span className="font-bold font-mono text-[10px] uppercase text-vlink-trust-deep flex items-center gap-1">
                <ShieldCheck className="w-4.5 h-4.5 text-vlink-trust" /> Insurance Integration
              </span>
              <p className="text-[10px] text-vlink-ink-soft leading-relaxed">
                Platform successfully connected to Star Health and Care Health API registries for automated document fetching.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

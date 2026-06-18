"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Lock, LogIn, Sparkles, CheckCircle } from "lucide-react";
import { supabase, isRealSupabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (localStorage.getItem("vlink_logged_in") === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (isRealSupabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          setErrorMsg(error.message);
        } else {
          localStorage.setItem("vlink_logged_in", "true");
          localStorage.setItem("vlink_uid", data.user?.id || "");
          window.dispatchEvent(new Event("vlink_auth_change"));
          router.push("/dashboard");
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock Login Mode
      setTimeout(() => {
        setIsLoading(false);
        
        // Load mock profiles
        const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
        let mockProfiles = JSON.parse(mockProfilesStr);
        
        // Seed default profiles if not present
        const hasAanya = mockProfiles.some((p: any) => p.id === "aanya-verma");
        if (!hasAanya) {
          mockProfiles.push({
            id: 'aanya-verma',
            full_name: 'Aanya Verma',
            email: 'aanya@verma.com',
            password: 'password123',
            blood_group: 'O+',
            date_of_birth: '1995-04-12',
            address: '74, Park Street, Bengaluru, Karnataka, India',
            medical_conditions: 'Type 1 diabetes, carries insulin in bag.',
            allergies: 'Penicillin, Shellfish',
            current_medications: 'Humalog (Insulin Lyspro), Metformin',
            organ_donor: true,
            insurance_provider: 'Care Health Insurance',
            insurance_policy_number: 'CHI-99887722-A',
            primary_doctor_name: 'Dr. Ramesh Nair',
            primary_doctor_phone: '+91 98765 43210',
            is_premium: true,
            created_at: new Date().toISOString(),
            phone: '9876543210',
            vehicle_number: 'KA-03-MP-8899',
            father_mother_phone: '9888877777',
            brother_sister_phone: '9666655555',
            friend_phone: '9555544444'
          });
        }
        
        const hasFaiz = mockProfiles.some((p: any) => p.id === "faiz");
        if (!hasFaiz) {
          mockProfiles.push({
            id: 'faiz',
            full_name: 'Faiz',
            email: 'faiz@gmail.com',
            password: 'password123',
            blood_group: 'A+',
            date_of_birth: '1998-08-15',
            address: '12, Mohammad Ali Road, Mumbai, Maharashtra, India',
            medical_conditions: 'Severe chronic Asthma, carrying inhaler in pocket.',
            allergies: 'Peanuts, Nuts, Bee stings',
            current_medications: 'Albuterol Inhaler (as needed), Montelukast 10mg',
            organ_donor: true,
            insurance_provider: 'Star Health Insurance',
            insurance_policy_number: 'SHI-ASTHMA-7722',
            primary_doctor_name: 'Dr. Sameer Khan',
            primary_doctor_phone: '+91 91111 22222',
            is_premium: true,
            created_at: new Date().toISOString(),
            phone: '9131797588',
            vehicle_number: 'MH-01-AB-1234',
            father_mother_phone: '9999988888',
            brother_sister_phone: '9999977777',
            friend_phone: '9131797588'
          });
        }
        
        localStorage.setItem("vlink_profiles", JSON.stringify(mockProfiles));
        
        // Find matching profile
        const user = mockProfiles.find((p: any) => p.email && p.email.toLowerCase() === email.toLowerCase());
        
        if (user) {
          if (user.password === password) {
            localStorage.setItem("vlink_logged_in", "true");
            localStorage.setItem("vlink_uid", user.id);
            window.dispatchEvent(new Event("vlink_auth_change"));
            router.push("/dashboard");
          } else {
            setErrorMsg("Incorrect password. Please try again.");
          }
        } else {
          setErrorMsg("Account not found. Please sign up to create an account.");
        }
      }, 800);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-vlink-paper/20">
        <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-4 text-center">
          <h2 className="text-3xl font-extrabold text-vlink-trust-deep font-display">
            Sign in to RescueQR
          </h2>
          <p className="text-sm text-vlink-ink-soft">
            Or{" "}
            <Link href="/auth/signup" className="font-semibold text-vlink-pulse hover:text-vlink-pulse/90">
              create a new account
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 border border-vlink-line sm:rounded-3xl sm:px-10 shadow-sm space-y-6">
            {!isRealSupabase && (
              <div className="p-4 bg-vlink-trust/5 border border-vlink-trust/20 rounded-2xl flex gap-2.5 items-start">
                <Sparkles className="w-5 h-5 text-vlink-pulse flex-shrink-0 mt-0.5" />
                <div className="text-xs text-vlink-trust-deep leading-relaxed">
                  <span className="font-bold">Offline Demo Mode Active</span>
                  <p className="text-vlink-ink-soft mt-0.5">
                    No Supabase database connected yet. You can sign in using **any email and password** to view the dashboards and profiles instantly.
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleLogin}>
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-vlink-trust-deep">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-vlink-ink-soft/60" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aanya@verma.com"
                    className="w-full pl-10 pr-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-vlink-trust-deep">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-vlink-ink-soft/60" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 border border-transparent rounded-full text-sm font-bold text-white bg-vlink-pulse hover:bg-vlink-pulse/90 focus:outline-none shadow-md transition-colors disabled:opacity-50"
                >
                  <LogIn className="w-4 h-4" /> 
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

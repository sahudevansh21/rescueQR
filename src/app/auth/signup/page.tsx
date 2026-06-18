"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Lock, User, UserPlus, Sparkles, Phone } from "lucide-react";
import { supabase, isRealSupabase } from "@/lib/supabase";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("vlink_logged_in") === "true") {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    if (isRealSupabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone
            }
          }
        });
        
        if (error) {
          setErrorMsg(error.message);
        } else {
          // Add default profile record in profiles table
          const uid = data.user?.id;
          if (uid) {
            await supabase.from("profiles").insert({
              id: uid,
              full_name: fullName,
              primary_doctor_phone: phone,
              is_premium: false
            });
          }
          
          localStorage.setItem("vlink_logged_in", "true");
          localStorage.setItem("vlink_uid", uid || "");
          window.dispatchEvent(new Event("vlink_auth_change"));
          router.push("/dashboard/profile"); // Go to profile setup
        }
      } catch (err: any) {
        setErrorMsg(err.message || "An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock Sign Up
      setTimeout(() => {
        setIsLoading(false);
        const uid = "p-" + Math.random().toString(36).substr(2, 9);
        
        // Save initial profile details in localStorage mock store
        const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
        const mockProfiles = JSON.parse(mockProfilesStr);
        
        mockProfiles.push({
          id: uid,
          full_name: fullName,
          email: email.toLowerCase(),
          password: password,
          blood_group: "",
          date_of_birth: "",
          address: "",
          medical_conditions: "",
          allergies: "",
          current_medications: "",
          organ_donor: false,
          insurance_provider: "",
          insurance_policy_number: "",
          primary_doctor_name: "",
          primary_doctor_phone: phone,
          is_premium: false,
          created_at: new Date().toISOString()
        });
        
        localStorage.setItem("vlink_profiles", JSON.stringify(mockProfiles));
        localStorage.setItem("vlink_logged_in", "true");
        localStorage.setItem("vlink_uid", uid);
        window.dispatchEvent(new Event("vlink_auth_change"));
        router.push("/dashboard/profile"); // Direct to edit profile page
      }, 800);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-vlink-paper/20">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-4">
          <h2 className="text-3xl font-extrabold text-vlink-trust-deep font-display">
            Create your emergency ID
          </h2>
          <p className="text-sm text-vlink-ink-soft">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-vlink-pulse hover:text-vlink-pulse/90">
              Sign in
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
                    No database connected yet. Signing up will store your profile details in your browser's local cache.
                  </p>
                </div>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSignup}>
              <div className="space-y-1.5">
                <label htmlFor="name" className="text-xs font-semibold text-vlink-trust-deep">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-vlink-ink-soft/60" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aanya Verma"
                    className="w-full pl-10 pr-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-vlink-trust-deep">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-vlink-ink-soft/60" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. aanya@verma.com"
                    className="w-full pl-10 pr-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone" className="text-xs font-semibold text-vlink-trust-deep">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-vlink-ink-soft/60" />
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98888 77777"
                    className="w-full pl-10 pr-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-xs font-semibold text-vlink-trust-deep">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-vlink-ink-soft/60" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
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
                  <UserPlus className="w-4 h-4" /> 
                  {isLoading ? "Creating account..." : "Sign Up"}
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

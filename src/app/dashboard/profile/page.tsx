"use client";

import React, { useState, useEffect } from "react";
import { 
  User, 
  Activity, 
  ShieldCheck, 
  PhoneCall, 
  Save, 
  Plus, 
  Trash, 
  ShieldAlert, 
  Sparkles,
  Info
} from "lucide-react";
import { supabase, isRealSupabase } from "@/lib/supabase";

interface Contact {
  id: string;
  name: string;
  relationship: string;
  phone_number: string;
  is_primary: boolean;
}

export default function ProfilePage() {
  const [profileId, setProfileId] = useState("");
  const [fullName, setFullName] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [medicalConditions, setMedicalConditions] = useState("");
  const [allergies, setAllergies] = useState("");
  const [currentMedications, setCurrentMedications] = useState("");
  const [organDonor, setOrganDonor] = useState(false);
  const [insuranceProvider, setInsuranceProvider] = useState("");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState("");
  const [primaryDoctorName, setPrimaryDoctorName] = useState("");
  const [primaryDoctorPhone, setPrimaryDoctorPhone] = useState("");
  
  // Lifeline QR specific fields
  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [fatherMotherPhone, setFatherMotherPhone] = useState("");
  const [brotherSisterPhone, setBrotherSisterPhone] = useState("");
  const [friendPhone, setFriendPhone] = useState("");
  const [governmentId, setGovernmentId] = useState("");
  
  // Emergency Contacts state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContactName, setNewContactName] = useState("");
  const [newContactRel, setNewContactRel] = useState("");
  const [newContactPhone, setNewContactPhone] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [prepScore, setPrepScore] = useState(0);

  useEffect(() => {
    loadProfile();
  }, []);

  // Calculate Preparedness Score dynamically
  useEffect(() => {
    let score = 0;
    if (fullName) score += 10;
    if (bloodGroup) score += 10;
    if (dob) score += 10;
    if (address) score += 10;
    if (medicalConditions) score += 10;
    if (allergies) score += 10;
    if (currentMedications) score += 10;
    if (insuranceProvider && insurancePolicyNumber) score += 10;
    if (primaryDoctorName && primaryDoctorPhone) score += 10;
    if (governmentId) score += 10;
    if (contacts.length > 0) score += 10;
    setPrepScore(score);
  }, [
    fullName, bloodGroup, dob, address, medicalConditions, 
    allergies, currentMedications, insuranceProvider, 
    insurancePolicyNumber, primaryDoctorName, primaryDoctorPhone, contacts, governmentId
  ]);

  const loadProfile = async () => {
    setIsLoading(true);
    const uid = localStorage.getItem("vlink_uid") || "aanya-verma";
    setProfileId(uid);

    if (isRealSupabase) {
      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", uid)
          .maybeSingle();

        if (profile) {
          setFullName(profile.full_name || "");
          setBloodGroup(profile.blood_group || "");
          setDob(profile.date_of_birth || "");
          setAddress(profile.address || "");
          setMedicalConditions(profile.medical_conditions || "");
          setAllergies(profile.allergies || "");
          setCurrentMedications(profile.current_medications || "");
          setOrganDonor(profile.organ_donor || false);
          setInsuranceProvider(profile.insurance_provider || "");
          setInsurancePolicyNumber(profile.insurance_policy_number || "");
          setPrimaryDoctorName(profile.primary_doctor_name || "");
          setPrimaryDoctorPhone(profile.primary_doctor_phone || "");
          setPhone(profile.phone || "");
          setVehicleNumber(profile.vehicle_number || "");
          setFatherMotherPhone(profile.father_mother_phone || "");
          setBrotherSisterPhone(profile.brother_sister_phone || "");
          setFriendPhone(profile.friend_phone || "");
          setGovernmentId(profile.government_id || "");
        }

        const { data: fetchedContacts } = await supabase
          .from("emergency_contacts")
          .select("*")
          .eq("profile_id", uid);
          
        if (fetchedContacts) {
          setContacts(fetchedContacts);
        }
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Mock loading logic
      const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
      const mockProfiles = JSON.parse(mockProfilesStr);
      let profile = mockProfiles.find((p: any) => p.id === uid);

      // Seed if using default user and not present in local list
      if (!profile && uid === "aanya-verma") {
        profile = {
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
          primary_doctor_phone: "+91 98765 43210"
        };
      }

      if (profile) {
        setFullName(profile.full_name || "");
        setBloodGroup(profile.blood_group || "");
        setDob(profile.date_of_birth || "");
        setAddress(profile.address || "");
        setMedicalConditions(profile.medical_conditions || "");
        setAllergies(profile.allergies || "");
        setCurrentMedications(profile.current_medications || "");
        setOrganDonor(profile.organ_donor || false);
        setInsuranceProvider(profile.insurance_provider || "");
        setInsurancePolicyNumber(profile.insurance_policy_number || "");
        setPrimaryDoctorName(profile.primary_doctor_name || "");
        setPrimaryDoctorPhone(profile.primary_doctor_phone || "");
        setPhone(profile.phone || "");
        setVehicleNumber(profile.vehicle_number || "");
        setFatherMotherPhone(profile.father_mother_phone || "");
        setBrotherSisterPhone(profile.brother_sister_phone || "");
        setFriendPhone(profile.friend_phone || "");
        setGovernmentId(profile.government_id || "");
      }

      const mockContactsStr = localStorage.getItem("vlink_contacts") || "[]";
      const mockContacts = JSON.parse(mockContactsStr);
      const userContacts = mockContacts.filter((c: any) => c.profile_id === uid);
      
      // Default mock contacts if empty
      if (userContacts.length === 0 && uid === "aanya-verma") {
        const defaultContacts = [
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
        setContacts(defaultContacts);
      } else {
        setContacts(userContacts);
      }
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");

    const uid = profileId;

    const profileData = {
      id: uid,
      full_name: fullName,
      blood_group: bloodGroup,
      date_of_birth: dob,
      address,
      medical_conditions: medicalConditions,
      allergies,
      current_medications: currentMedications,
      organ_donor: organDonor,
      insurance_provider: insuranceProvider,
      insurance_policy_number: insurancePolicyNumber,
      primary_doctor_name: primaryDoctorName,
      primary_doctor_phone: primaryDoctorPhone,
      phone,
      vehicle_number: vehicleNumber,
      father_mother_phone: fatherMotherPhone,
      brother_sister_phone: brotherSisterPhone,
      friend_phone: friendPhone,
      government_id: governmentId,
      updated_at: new Date().toISOString()
    };

    if (isRealSupabase) {
      try {
        const { error } = await supabase
          .from("profiles")
          .upsert(profileData);
        if (error) throw error;
        setSaveStatus("success");
      } catch (err) {
        console.error("Error saving profile:", err);
        setSaveStatus("error");
      } finally {
        setIsSaving(false);
      }
    } else {
      // Mock saving profile
      setTimeout(() => {
        const mockProfilesStr = localStorage.getItem("vlink_profiles") || "[]";
        let mockProfiles = JSON.parse(mockProfilesStr);
        const idx = mockProfiles.findIndex((p: any) => p.id === uid);

        if (idx !== -1) {
          mockProfiles[idx] = { ...mockProfiles[idx], ...profileData };
        } else {
          mockProfiles.push(profileData);
        }
        localStorage.setItem("vlink_profiles", JSON.stringify(mockProfiles));
        
        // Save contacts state in LocalStorage as well
        localStorage.setItem("vlink_contacts", JSON.stringify(contacts));
        
        setIsSaving(false);
        setSaveStatus("success");
      }, 600);
    }
  };

  const addContact = () => {
    if (!newContactName || !newContactPhone) return;

    const newContact: Contact = {
      id: Math.random().toString(36).substr(2, 9),
      name: newContactName,
      relationship: newContactRel || "Contact",
      phone_number: newContactPhone,
      is_primary: contacts.length === 0 // Make first primary
    };

    setContacts(prev => [...prev, newContact]);
    setNewContactName("");
    setNewContactRel("");
    setNewContactPhone("");
  };

  const deleteContact = (id: string) => {
    setContacts(prev => prev.filter(c => c.id !== id));
  };

  const setPrimaryContact = (id: string) => {
    setContacts(prev => prev.map(c => ({
      ...c,
      is_primary: c.id === id
    })));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-vlink-trust border-t-vlink-pulse rounded-full animate-spin" />
        <p className="text-sm font-mono text-vlink-ink-soft">Loading profile details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header card with preparedness score */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row gap-6 md:items-center justify-between border border-vlink-line">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-vlink-trust-deep font-display">Emergency Profile</h1>
          <p className="text-sm text-vlink-ink-soft">
            Keep your clinical details updated. Responders will access this data during critical scans.
          </p>
        </div>
        
        {/* Preparedness Score Widget */}
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-vlink-line shadow-sm">
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-vlink-paper"
                strokeWidth="3"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={`${prepScore >= 80 ? 'text-vlink-success' : prepScore >= 50 ? 'text-vlink-trust' : 'text-vlink-pulse'}`}
                strokeDasharray={`${prepScore}, 100`}
                strokeWidth="3"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <span className="absolute font-mono text-sm font-extrabold text-vlink-trust-deep">{prepScore}%</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-vlink-ink-soft uppercase tracking-wider block">Preparedness Score</span>
            <span className="text-xs text-vlink-ink-soft leading-tight">
              {prepScore === 100 ? "Ready for anything! ✓" : "Fill more fields to improve readiness."}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveProfile} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-8">
          {/* Section 1: Personal Details */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vlink-line space-y-6">
            <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-vlink-trust" /> 1. Personal Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-vlink-trust-deep">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aanya Verma"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Mobile Number (नाम का मोबाइल न.) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 9131797588"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Vehicle Number (गाड़ी न.)</label>
                <input
                  type="text"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. KA-03-MP-8899"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Date of Birth</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-vlink-trust-deep">Residential Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Street, City, State, ZIP"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-vlink-trust-deep">Government Document ID (Aadhaar / PAN / DL / Passport)</label>
                <input
                  type="text"
                  value={governmentId}
                  onChange={(e) => setGovernmentId(e.target.value)}
                  placeholder="e.g. Aadhaar 1234-5678-9012 or PAN ABCDE1234F"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Vitals */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vlink-line space-y-6">
            <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3 flex items-center gap-2">
              <Activity className="w-5 h-5 text-vlink-pulse" /> 2. Clinical Emergency Details
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Allergies (Penicillin, Nuts, Bee stings)</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="e.g. Penicillin, Peanuts (highly critical)"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 border-l-4 border-l-vlink-pulse"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Medical Conditions</label>
                <textarea
                  rows={3}
                  value={medicalConditions}
                  onChange={(e) => setMedicalConditions(e.target.value)}
                  placeholder="e.g. Type 1 diabetes, Asthmatic, Heart surgery in 2024"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 resize-none"
                ></textarea>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Current Medications & Dosages</label>
                <textarea
                  rows={3}
                  value={currentMedications}
                  onChange={(e) => setCurrentMedications(e.target.value)}
                  placeholder="e.g. Humalog insulin (3x daily), Metformin 500mg"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 bg-vlink-paper/30 p-4 rounded-2xl border border-vlink-line">
                <input
                  id="organDonor"
                  type="checkbox"
                  checked={organDonor}
                  onChange={(e) => setOrganDonor(e.target.checked)}
                  className="w-5 h-5 accent-vlink-trust"
                />
                <label htmlFor="organDonor" className="text-xs font-semibold text-vlink-trust-deep cursor-pointer">
                  I am a registered Organ Donor (will show organ donor badge prominently on scan page)
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Insurance & Doctor */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vlink-line space-y-6">
            <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-vlink-trust" /> 3. Insurance & Primary Doctor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Insurance Provider</label>
                <input
                  type="text"
                  value={insuranceProvider}
                  onChange={(e) => setInsuranceProvider(e.target.value)}
                  placeholder="e.g. Star Health Insurance"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Policy Number</label>
                <input
                  type="text"
                  value={insurancePolicyNumber}
                  onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                  placeholder="e.g. STAR-00998822"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Primary Care Doctor</label>
                <input
                  type="text"
                  value={primaryDoctorName}
                  onChange={(e) => setPrimaryDoctorName(e.target.value)}
                  placeholder="Dr. Full Name"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Doctor Contact Number</label>
                <input
                  type="tel"
                  value={primaryDoctorPhone}
                  onChange={(e) => setPrimaryDoctorPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Lifeline Emergency Contacts (Direct Mappings) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-vlink-line space-y-6">
            <h3 className="text-lg font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-vlink-pulse" /> 4. Emergency Contacts (आपातकालीन नंबर)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Father/Mother's Mobile (पिता/ माता के मोबाइल न.)</label>
                <input
                  type="tel"
                  value={fatherMotherPhone}
                  onChange={(e) => setFatherMotherPhone(e.target.value)}
                  placeholder="e.g. 9888877777"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-vlink-trust-deep">Brother/Sister's Mobile (भाई/बहन के मोबाइल न.)</label>
                <input
                  type="tel"
                  value={brotherSisterPhone}
                  onChange={(e) => setBrotherSisterPhone(e.target.value)}
                  placeholder="e.g. 9666655555"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>

              <div className="space-y-1.5 col-span-2">
                <label className="text-xs font-semibold text-vlink-trust-deep">Friend's Mobile (मित्र के मोबाइल न.)</label>
                <input
                  type="tel"
                  value={friendPhone}
                  onChange={(e) => setFriendPhone(e.target.value)}
                  placeholder="e.g. 9555544444"
                  className="w-full px-4 py-3 border border-vlink-line rounded-xl text-sm outline-none focus:border-vlink-trust bg-vlink-paper/10 font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar for emergency contacts */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-vlink-line space-y-6">
            <h3 className="text-md font-bold text-vlink-trust-deep font-display border-b border-vlink-line pb-3 flex items-center gap-2">
              <PhoneCall className="w-4.5 h-4.5 text-vlink-pulse" /> Emergency Contacts
            </h3>

            {/* List */}
            <div className="space-y-3">
              {contacts.length === 0 ? (
                <div className="text-xs text-vlink-ink-soft bg-vlink-paper/40 p-4 rounded-2xl border border-dashed border-vlink-line text-center">
                  No contacts added yet. Add at least one contact.
                </div>
              ) : (
                contacts.map((c) => (
                  <div key={c.id} className="p-3 bg-vlink-paper/30 border border-vlink-line rounded-2xl flex flex-col gap-2 relative">
                    <button
                      type="button"
                      onClick={() => deleteContact(c.id)}
                      className="absolute top-2.5 right-2.5 text-vlink-ink-soft/40 hover:text-vlink-pulse"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-vlink-trust-deep">{c.name}</span>
                        {c.is_primary && (
                          <span className="bg-vlink-pulse text-white text-[9px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">Primary</span>
                        )}
                      </div>
                      <span className="text-[10px] text-vlink-ink-soft block font-mono mt-0.5">{c.relationship} · {c.phone_number}</span>
                    </div>
                    {!c.is_primary && (
                      <button
                        type="button"
                        onClick={() => setPrimaryContact(c.id)}
                        className="text-[9px] font-bold text-vlink-trust hover:underline w-fit"
                      >
                        Make Primary
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Add box */}
            <div className="border-t border-vlink-line/60 pt-4 space-y-3">
              <h4 className="text-xs font-bold text-vlink-trust-deep font-mono uppercase tracking-wider">Add Contact</h4>
              <div className="space-y-2 text-xs">
                <input
                  type="text"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="Contact Name (e.g. Mother)"
                  className="w-full px-3 py-2.5 border border-vlink-line rounded-lg outline-none bg-vlink-paper/10"
                />
                <input
                  type="text"
                  value={newContactRel}
                  onChange={(e) => setNewContactRel(e.target.value)}
                  placeholder="Relationship (e.g. Spouse)"
                  className="w-full px-3 py-2.5 border border-vlink-line rounded-lg outline-none bg-vlink-paper/10"
                />
                <input
                  type="tel"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="Phone Number (+91...)"
                  className="w-full px-3 py-2.5 border border-vlink-line rounded-lg outline-none bg-vlink-paper/10"
                />
                <button
                  type="button"
                  onClick={addContact}
                  className="w-full py-2 bg-vlink-trust text-white text-xs font-bold rounded-lg hover:bg-vlink-trust/95 flex items-center justify-center gap-1 shadow"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to List
                </button>
              </div>
            </div>
          </div>

          {/* Alert / Save panel */}
          <div className="bg-white p-6 rounded-3xl border border-vlink-line space-y-4">
            {saveStatus === "success" && (
              <div className="text-xs text-vlink-success bg-green-50 border border-green-200 p-3.5 rounded-2xl flex gap-2">
                <CheckCircle className="w-5 h-5 flex-shrink-0 text-vlink-success" />
                <div>
                  <span className="font-bold">Profile Saved!</span>
                  <p className="mt-0.5 text-vlink-ink-soft">Emergency QR data has been successfully updated.</p>
                </div>
              </div>
            )}
            
            {saveStatus === "error" && (
              <div className="text-xs text-red-600 bg-red-50 border border-red-200 p-3.5 rounded-2xl flex gap-2">
                <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500" />
                <div>
                  <span className="font-bold">Save Failed</span>
                  <p className="mt-0.5 text-vlink-ink-soft">Could not write details to database. Try again.</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-4 bg-vlink-pulse hover:bg-vlink-pulse/90 text-white font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-md transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving details..." : "Save Profile"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Small helper just in case
function CheckCircle(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

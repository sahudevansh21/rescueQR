import { NextResponse } from "next/server";
import { supabase, isRealSupabase } from "@/lib/supabase";
import { sendEmergencySMS, sendEmergencyEmail } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const { profile_id, latitude, longitude, user_agent } = await request.json();
    
    if (!profile_id) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = user_agent || request.headers.get("user-agent") || "Unknown Device";
    
    // Reverse-geocode coordinates to location name (simulated)
    let locationName = "Emergency scan recorded";
    if (latitude && longitude) {
      locationName = `Near Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}`;
    }

    const scanRecord = {
      profile_id,
      scanned_at: new Date().toISOString(),
      latitude: latitude || null,
      longitude: longitude || null,
      ip_address: ip,
      user_agent: userAgent,
      location_name: locationName
    };

    let contacts: any[] = [];
    let profileName = "Tag Owner";

    if (isRealSupabase) {
      // Log to database
      await supabase.from("scan_logs").insert(scanRecord);

      // Get profile name
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", profile_id)
        .maybeSingle();
      if (profile) profileName = profile.full_name;

      // Fetch contacts
      const { data: contactsData } = await supabase
        .from("emergency_contacts")
        .select("name, phone_number")
        .eq("profile_id", profile_id);
      contacts = contactsData || [];
    } else {
      // Mock mode logging
      const mockScansStr = global.localStorage ? localStorage.getItem("vlink_scans") || "[]" : "[]";
      // Let's use global server DB cache first
      const globalAny = global as any;
      if (!globalAny.__mockDb) {
        globalAny.__mockDb = { profiles: [], contacts: [], scans: [] };
      }
      globalAny.__mockDb.scans.push(scanRecord);

      // If localStorage is accessible, write it there too
      if (typeof window !== "undefined") {
        const scans = JSON.parse(localStorage.getItem("vlink_scans") || "[]");
        scans.push(scanRecord);
        localStorage.setItem("vlink_scans", JSON.stringify(scans));
      }

      // Read profiles for name
      const profile = globalAny.__mockDb.profiles.find((p: any) => p.id === profile_id);
      if (profile) profileName = profile.full_name;

      // Fetch contacts
      contacts = globalAny.__mockDb.contacts.filter((c: any) => c.profile_id === profile_id);
      if (contacts.length === 0 && profile_id === "aanya-verma") {
        contacts = [
          { name: "Priya Verma (Mother)", phone_number: "+91 98888 77777" },
          { name: "Rahul Verma (Brother)", phone_number: "+91 96666 55555" }
        ];
      }
    }

    // Trigger simulated notifications for all contacts
    const mapLink = latitude && longitude
      ? `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`
      : "Not available (location permission denied)";

    const notificationLogs = [];
    for (const c of contacts) {
      const smsLog = await sendEmergencySMS(c.name, c.phone_number, profileName, mapLink);
      notificationLogs.push(smsLog);
    }

    return NextResponse.json({
      success: true,
      scan: scanRecord,
      notifications: notificationLogs
    });

  } catch (err: any) {
    console.error("Scan API Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

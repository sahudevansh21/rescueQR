import { NextResponse } from "next/server";
import { getEmergencySummary } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { profile } = await request.json();
    if (!profile) {
      return NextResponse.json({ error: "Profile data is required" }, { status: 400 });
    }
    const summary = await getEmergencySummary(profile);
    return NextResponse.json({ summary });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate AI brief" }, { status: 500 });
  }
}

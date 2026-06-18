import { NextResponse } from "next/server";
import { getFamilyGuidance } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { profile } = await request.json();
    if (!profile) {
      return NextResponse.json({ error: "Profile data is required" }, { status: 400 });
    }
    const guidance = await getFamilyGuidance(profile);
    return NextResponse.json({ guidance });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate AI guidance" }, { status: 500 });
  }
}

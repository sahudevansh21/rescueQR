import { NextResponse } from "next/server";
import { getMedicalInsights } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { profile } = await request.json();
    if (!profile) {
      return NextResponse.json({ error: "Profile data is required" }, { status: 400 });
    }
    const insights = await getMedicalInsights(profile);
    return NextResponse.json({ insights });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate AI insights" }, { status: 500 });
  }
}

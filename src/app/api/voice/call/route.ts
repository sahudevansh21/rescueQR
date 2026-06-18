import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { 
      phoneNumber, 
      patientName, 
      bloodGroup, 
      conditions, 
      allergies, 
      medications,
      locationLink 
    } = await request.json();

    if (!phoneNumber || !patientName) {
      return NextResponse.json({ error: "Phone number and patient name are required" }, { status: 400 });
    }

    const apiKey = process.env.OMNIDIM_API_KEY || "";
    const agentId = process.env.OMNIDIM_AGENT_ID || "";

    // Offline simulation mode
    if (!apiKey || !agentId) {
      console.log(`[OMNIDIM SIMULATION] Dispatching AI voice call to ${phoneNumber} for patient ${patientName}`);
      return NextResponse.json({
        status: "success",
        demo: true,
        message: "Demo Mode: Voice call registered. Triggering local synthesized voice call on screen."
      });
    }

    // Call OmniDimension (omnidim.io) API
    // We send an outbound call request containing custom variables that the agent can read
    const url = "https://backend.omnidim.io/api/v1/calls";
    const body = {
      phone_number: phoneNumber,
      agent_id: agentId,
      variables: {
        patient_name: patientName,
        blood_group: bloodGroup || "Not specified",
        medical_conditions: conditions || "None reported",
        allergies: allergies || "No known allergies",
        medications: medications || "None reported",
        location_link: locationLink || ""
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OmniDim API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({
      status: "success",
      demo: false,
      callId: data.id || data.call_id || "omni-call-id",
      message: "Outbound call successfully dispatched via OmniDimension AI Agent."
    });

  } catch (err: any) {
    console.error("Voice call dispatch failed:", err);
    return NextResponse.json({ error: err.message || "Failed to dispatch call" }, { status: 500 });
  }
}

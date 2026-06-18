import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || '';
const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

let genAI: any = null;

if (apiKey) {
  try {
    // Correct constructor for @google/generative-ai
    genAI = new GoogleGenerativeAI(apiKey);
  } catch (e) {
    console.error('Failed to initialize GoogleGenerativeAI SDK, will use fetch fallback:', e);
  }
}

async function callGeminiRaw(systemInstruction: string, prompt: string): Promise<string> {
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }

  // Raw API call using standard fetch for robust execution without SDK version problems
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 600,
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
}

// 1. AI Emergency Summary
export async function getEmergencySummary(profile: any): Promise<string> {
  const system = `You are an AI medical emergency assistant embedded in RescueQR.
Analyze the user's emergency profile and generate a 10-second first-responder summary.
Identify:
1. Critical risks (allergies, heart conditions, diabetes, etc.)
2. Emergency treatment suggestions (actions to take, what to look for)
3. Blood group & donor status
Use short, scannable bullet points, plain language, and high urgency. Max 80 words.`;

  const prompt = `Profile Data:\n${JSON.stringify(profile, null, 2)}`;

  if (!apiKey) {
    // Mock simulation based on profile details
    return `• **CRITICAL RISK:** ${profile.allergies ? `ALLERGIC TO ${profile.allergies.toUpperCase()}. Avoid administering.` : 'No known drug allergies reported.'}
• **DIABETES CARE:** ${profile.medical_conditions ? profile.medical_conditions : 'No chronic conditions reported.'}
• **BLOOD TYPE:** ${profile.blood_group || 'Not specified'} (Organ Donor: ${profile.organ_donor ? 'YES' : 'NO'})
• **DOCTOR TO CONTACT:** ${profile.primary_doctor_name || 'Not provided'} (${profile.primary_doctor_phone || 'N/A'})
*(Simulated AI Summary. Set GEMINI_API_KEY to enable live generation)*`;
  }

  try {
    return await callGeminiRaw(system, prompt);
  } catch (err: any) {
    console.error(err);
    return `Error generating live AI summary. Fallback details:\n• Blood Group: ${profile.blood_group || 'Unknown'}\n• Allergies: ${profile.allergies || 'None listed'}\n• Conditions: ${profile.medical_conditions || 'None'}`;
  }
}

// 2. AI Doctor Assistant Notes
export async function getDoctorNotes(profile: any): Promise<string> {
  const system = `You are an AI Clinical Assistant. 
Generate a professional, structured medical history summary and emergency clinical overview for medical professionals (doctors/nurses).
Include:
- Patient Overview
- Active Medical Issues & Medications
- Key Warnings & Contradictions (e.g. drug interactions based on profile)
- Suggested Initial Triage Notes
Use professional clinical terminology, structured sections. Max 150 words.`;

  const prompt = `Patient Profile:\n${JSON.stringify(profile, null, 2)}`;

  if (!apiKey) {
    return `### Clinical Overview & Triage Notes
**Patient Profile:** ${profile.full_name}, DOB: ${profile.date_of_birth || 'N/A'}.
**Active Issues:** ${profile.medical_conditions || 'No chronic conditions reported.'}
**Current Regimen:** ${profile.current_medications || 'No current medications reported.'}
**Key Contraindications:** Avoid penicillin or allergens listed: ${profile.allergies || 'none'}. If unconscious, evaluate for diabetic shock/hypoglycemia.
**Initial Recommendation:** Confirm vitals, check blood sugar levels if diabetic signs present. Contact primary care physician ${profile.primary_doctor_name || 'N/A'} at ${profile.primary_doctor_phone || 'N/A'}.
*(Simulated Clinical Notes. Set GEMINI_API_KEY to enable live generation)*`;
  }

  try {
    return await callGeminiRaw(system, prompt);
  } catch (err: any) {
    console.error(err);
    return `Error generating clinical notes. Please refer to raw profile fields for active conditions and medications.`;
  }
}

// 3. AI Family Guidance Checklist
export async function getFamilyGuidance(profile: any): Promise<string> {
  const system = `You are an AI Family Caregiver Companion. 
A family member's emergency tag was just scanned. 
Generate a calm, reassuring explanation of what steps to take right now.
Provide:
- A simple, plain-language summary of what is happening
- Reassurance & breathing steps
- A checklist of what to prepare for the hospital (insurance card, medication names, clothes)
- Checklist of questions to ask doctors
Use bullet points and friendly, reassuring tone. Max 150 words.`;

  const prompt = `Emergency profile details:\n${JSON.stringify(profile, null, 2)}`;

  if (!apiKey) {
    return `### Guidance for ${profile.full_name}'s Family
A responder has just scanned ${profile.full_name}'s emergency QR code. Help is being coordinated. Stay calm.

**Next Steps Checklist:**
1. **Call emergency contacts:** Confirm Priya Verma (${profile.primary_doctor_phone || 'Emergency Contacts'}) has been notified.
2. **Pack essential items:** Grab ${profile.full_name}'s ID, physical insurance card (${profile.insurance_provider || 'Not specified'} Policy #${profile.insurance_policy_number || 'N/A'}), and any active medications.
3. **Head to the hospital:** Prepare list of active medications: ${profile.current_medications || 'none'}.

**Questions for the Doctors:**
- What is their current state?
- Are they breathing normally?
- Do you need details on their condition: ${profile.medical_conditions || 'None'}?
*(Simulated Guidance. Set GEMINI_API_KEY to enable live generation)*`;
  }

  try {
    return await callGeminiRaw(system, prompt);
  } catch (err: any) {
    console.error(err);
    return `Error generating family checklist. Stay calm. Collect the patient's ID, insurance documentation, and current medications, and head to the medical facility.`;
  }
}

// 4. AI Medical Insights & Preparedness Score
export async function getMedicalInsights(profile: any): Promise<{
  score: number;
  risks: string[];
  conflicts: string[];
  tips: string[];
}> {
  const system = `You are a preventive medical AI evaluator. 
Analyze the emergency profile and return a JSON payload evaluating:
1. "score": An emergency readiness score (0 to 100) based on fields filled (e.g. missing insurance, contacts, allergies reduces score).
2. "risks": A list of potential safety risks (e.g. diabetic, heart patient, missing emergency phone, etc.).
3. "conflicts": Potential drug/medication conflicts or general warnings.
4. "tips": 3 quick tips to improve their emergency preparedness.
Return ONLY valid JSON (no markdown, no backticks):
{
  "score": 85,
  "risks": ["Risk 1", "Risk 2"],
  "conflicts": ["Conflict 1"],
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

  const prompt = `Profile:\n${JSON.stringify(profile, null, 2)}`;

  if (!apiKey) {
    // Mock insights logic
    let score = 50;
    const risks: string[] = [];
    const conflicts: string[] = [];
    const tips: string[] = [];

    if (profile.full_name) score += 10;
    if (profile.blood_group) score += 10;
    if (profile.primary_doctor_name) score += 10;
    if (profile.insurance_provider) score += 10;
    if (profile.allergies) {
      score += 5;
      risks.push(`Potential severe reaction to: ${profile.allergies}`);
    } else {
      tips.push("Add any minor allergies or confirm 'No known allergies' to save time.");
    }
    
    if (profile.medical_conditions) {
      score += 5;
      risks.push(`Manages chronic condition: ${profile.medical_conditions}`);
    }
    
    if (profile.current_medications) {
      conflicts.push("Consult doctor before mixing with over-the-counter pain relievers.");
    }

    if (!profile.address) {
      tips.push("Add your home address so responders can verify your residency in crisis.");
    }
    if (!profile.insurance_policy_number) {
      tips.push("Add your insurance policy number to expedite hospital admission.");
    }
    tips.push("Print your emergency card and place it behind your phone case.");

    return {
      score: Math.min(score, 100),
      risks: risks.length > 0 ? risks : ["No major clinical risks identified."],
      conflicts: conflicts.length > 0 ? conflicts : ["No immediate medication conflicts flagged."],
      tips: tips.slice(0, 3)
    };
  }

  try {
    const text = await callGeminiRaw(system, prompt);
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch (err: any) {
    console.error(err);
    return {
      score: 75,
      risks: ["Error evaluating live risks. Please check fields manually."],
      conflicts: ["Could not process medication list for conflicts."],
      tips: ["Fill all profile fields completely", "Keep emergency contacts updated", "Check your doctor phone number"]
    };
  }
}

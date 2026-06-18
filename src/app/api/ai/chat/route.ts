import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const customKey = request.headers.get("x-gemini-key");
    const apiKey = customKey || process.env.GEMINI_API_KEY || "";
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash";

    const systemInstruction = `You are the customer support assistant on the RescueQR website. 
RescueQR sells dynamic emergency identification tags (cards, stickers, wristbands). Scanning a tag shows a person's blood group, allergies, medications, and emergency contacts to responders. It captures GPS coordinates and dispatches automated SMS alerts to families. Gemini AI generates concise summaries.
Answer questions about features, setup, and pricing (Free tier vs Premium $2.99/mo or $24/yr).
Be warm, professional, and keep replies short (under 60 words). If you don't know a detail, suggest contacting our advocacy team at support@rescueqr.com.`;

    if (!apiKey) {
      // Offline local Q&A answers mapping for mock mode
      const lowerMsg = message.toLowerCase();
      let reply = "I am currently in demo mode. Setting GEMINI_API_KEY in your env file will let me answer all your custom questions live!";
      
      if (lowerMsg.includes("how") && lowerMsg.includes("work")) {
        reply = "RescueQR gives you a unique QR code. First responders scan it to see your medical info. Simultaneously, we capture GPS coordinates and text your family.";
      } else if (lowerMsg.includes("price") || lowerMsg.includes("cost") || lowerMsg.includes("free")) {
        reply = "Our basic QR tag is 100% Free. RescueQR Premium is just $2.99/mo (or $24/yr) and includes Gemini AI briefs, SMS scan alerts, and document storage.";
      } else if (lowerMsg.includes("safe") || lowerMsg.includes("privacy") || lowerMsg.includes("secure")) {
        reply = "Your health data is highly secure. Profiles are protected by row-level database rules and are only displayed when your physical tag is scanned.";
      } else if (lowerMsg.includes("contact") || lowerMsg.includes("support")) {
        reply = "You can contact our advocacy support team at support@rescueqr.com or call us at +91 22 8887 7766.";
      }
      
      return NextResponse.json({ reply });
    }

    const isOpenRouter = apiKey.startsWith("sk-or-") || apiKey.startsWith("sk-");
    const url = isOpenRouter 
      ? "https://openrouter.ai/api/v1/chat/completions"
      : `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };

    if (isOpenRouter) {
      headers["Authorization"] = `Bearer ${apiKey}`;
      headers["HTTP-Referer"] = "https://rescueqr.com";
      headers["X-Title"] = "RescueQR";
    }

    const openRouterModel = modelName.includes("/") ? modelName : "google/gemini-2.5-flash";

    // Build history for OpenRouter standard chat completions format
    const openRouterMessages = [
      { role: "system", content: systemInstruction }
    ];
    if (Array.isArray(history)) {
      history.forEach((h: any) => {
        openRouterMessages.push({
          role: h.role === 'user' ? 'user' : 'assistant',
          content: h.text
        });
      });
    }
    openRouterMessages.push({ role: "user", content: message });

    // Parse chat context history for Google API
    const context = Array.isArray(history)
      ? history.map((h: any) => `${h.role === 'user' ? 'user' : 'model'}: ${h.text}`).join("\n") + "\n"
      : "";

    const body = isOpenRouter ? {
      model: openRouterModel,
      messages: openRouterMessages,
      temperature: 0.5,
      max_tokens: 200
    } : {
      contents: [{ role: "user", parts: [{ text: `${context}user: ${message}` }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] },
      generationConfig: {
        temperature: 0.5,
        maxOutputTokens: 200,
      }
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let reply = "";
    if (isOpenRouter) {
      reply = data?.choices?.[0]?.message?.content?.trim() || "I am here to help. Could you please rephrase your question?";
    } else {
      reply = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "I am here to help. Could you please rephrase your question?";
    }
    
    return NextResponse.json({ reply });

  } catch (err: any) {
    console.error("Chat API Error:", err);
    return NextResponse.json({ error: err.message || "Failed to call AI support" }, { status: 500 });
  }
}

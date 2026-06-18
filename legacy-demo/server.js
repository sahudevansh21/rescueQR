require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');

const app = express();
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const DB_PATH = path.join(__dirname, 'data', 'profiles.json');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---------- tiny file-based "database" ----------
function readProfiles() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return [];
  }
}
function writeProfiles(profiles) {
  fs.writeFileSync(DB_PATH, JSON.stringify(profiles, null, 2));
}

// ---------- Gemini helper ----------
async function callGemini(systemInstruction, userText) {
  if (!GEMINI_API_KEY) {
    throw new Error('NO_API_KEY');
  }
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
  const body = {
    contents: [{ role: 'user', parts: [{ text: userText }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
    generationConfig: { temperature: 0.4, maxOutputTokens: 500 }
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`GEMINI_ERROR: ${res.status} ${errText}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '';
  return text.trim();
}

function aiErrorStatus(err) {
  const msg = err.message || '';
  if (msg === 'NO_API_KEY') return 503;
  if (msg.includes('GEMINI_ERROR: 400') || msg.includes('GEMINI_ERROR: 403')) return 502;
  if (msg.includes('GEMINI_ERROR: 429')) return 429;
  return 500;
}
function aiErrorMessage(err) {
  const msg = err.message || '';
  console.error(err);
  if (msg === 'NO_API_KEY') {
    return 'AI features are not configured yet. Add a real GEMINI_API_KEY to your .env file (get one at aistudio.google.com/app/apikey).';
  }
  if (msg.includes('GEMINI_ERROR: 400') || msg.includes('GEMINI_ERROR: 403')) {
    return 'Gemini rejected the request — double check that GEMINI_API_KEY in your .env file is a real, valid key.';
  }
  if (msg.includes('GEMINI_ERROR: 429')) {
    return 'Gemini rate limit reached — try again in a moment.';
  }
  return 'AI is temporarily unavailable. Please try again.';
}

// ---------- Profile API ----------

// Create a new emergency profile + QR code
app.post('/api/profiles', async (req, res) => {
  try {
    const {
      name, address, bloodGroup, medicalConditions,
      allergies, emergencyContactName, emergencyContactPhone,
      secondaryContactName, secondaryContactPhone
    } = req.body || {};

    if (!name || !emergencyContactPhone) {
      return res.status(400).json({ error: 'Name and an emergency contact phone number are required.' });
    }

    const id = nanoid(10);
    const profile = {
      id,
      name, address: address || '', bloodGroup: bloodGroup || '',
      medicalConditions: medicalConditions || '', allergies: allergies || '',
      emergencyContactName: emergencyContactName || '', emergencyContactPhone,
      secondaryContactName: secondaryContactName || '', secondaryContactPhone: secondaryContactPhone || '',
      createdAt: new Date().toISOString()
    };

    const profiles = readProfiles();
    profiles.push(profile);
    writeProfiles(profiles);

    const profileUrl = `${req.protocol}://${req.get('host')}/profile/${id}`;
    const qrDataUrl = await QRCode.toDataURL(profileUrl, { width: 320, margin: 2 });

    res.json({ id, profileUrl, qrDataUrl });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create profile.' });
  }
});

// Fetch a profile's public emergency data (what a scan reveals)
app.get('/api/profiles/:id', (req, res) => {
  const profiles = readProfiles();
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });
  res.json(profile);
});

// AI Emergency Brief — Gemini summarizes the profile into a fast, first-responder-friendly briefing
app.post('/api/ai/brief/:id', async (req, res) => {
  const profiles = readProfiles();
  const profile = profiles.find(p => p.id === req.params.id);
  if (!profile) return res.status(404).json({ error: 'Profile not found.' });

  const system = `You are an AI assistant embedded in an emergency QR identification system called PulseTag QR.
A first responder or bystander has just scanned someone's tag. Turn the raw profile fields into a short, calm,
scannable briefing they can read in under 10 seconds. Lead with anything safety-critical (allergies, conditions,
blood group). Use plain language, short lines, no headers, no markdown, max 80 words. Never invent information
that wasn't provided.`;

  const userText = `Profile data:\n${JSON.stringify(profile, null, 2)}`;

  try {
    const text = await callGemini(system, userText);
    res.json({ brief: text });
  } catch (err) {
    res.status(aiErrorStatus(err)).json({ error: aiErrorMessage(err) });
  }
});

// General assistant widget on the marketing site (FAQs about the product)
app.post('/api/ai/chat', async (req, res) => {
  const { message, history } = req.body || {};
  if (!message) return res.status(400).json({ error: 'Message is required.' });

  const system = `You are the support assistant on the PulseTag QR website. PulseTag QR sells QR-code-based
emergency ID tags (cards/wristbands): scanning one shows a person's emergency contacts, blood group, medical
conditions, and allergies to help first responders act fast. Answer questions about how it works, pricing tiers
(Basic, Family, Senior/Kid), setup, and data privacy in a warm, concise way (under 60 words). If you don't know
a specific detail (like exact pricing), say a real team member can confirm it, don't invent numbers.`;

  const context = Array.isArray(history)
    ? history.map(h => `${h.role}: ${h.text}`).join('\n') + '\n'
    : '';

  try {
    const text = await callGemini(system, `${context}user: ${message}`);
    res.json({ reply: text });
  } catch (err) {
    res.status(aiErrorStatus(err)).json({ error: aiErrorMessage(err) });
  }
});

// ---------- Pages ----------
app.get('/profile/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'profile.html'));
});

app.listen(PORT, () => {
  console.log(`PulseTag QR running at http://localhost:${PORT}`);
  if (!GEMINI_API_KEY) {
    console.log('Note: GEMINI_API_KEY is not set — AI features will return a friendly error until you add one to .env');
  }
});

# PulseTag QR

A QR-code emergency-identification web app — scan a tag to see someone's emergency
contacts, blood group, allergies, and medical conditions, with a Gemini-powered
"AI Emergency Brief" that summarizes the profile for a first responder.

This is an original demo project (different name/branding/copy), built to the same
general concept brief you described, with Gemini AI integration added.

## What's inside

- `server.js` — Express backend. Serves the site, stores profiles, generates QR
  codes, and calls the Gemini API **server-side** (your API key never reaches
  the browser).
- `public/` — the frontend: landing page (`index.html`), the profile creation
  form (`create.html`), the public scanned-profile page (`profile.html`), plus
  CSS/JS.
- `data/profiles.json` — simple file-based storage for demo purposes (swap for
  a real database before going to production).

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy the environment template and add your Gemini key:
   ```
   cp .env.example .env
   ```
   Then edit `.env` and set `GEMINI_API_KEY` to a real key from
   https://aistudio.google.com/app/apikey
3. Start the server:
   ```
   npm start
   ```
4. Open http://localhost:3000

Without a real `GEMINI_API_KEY`, everything works except the two AI features
(the chat widget and the "Generate brief" button) — they'll show a clear
in-app message instead of failing silently.

## How the pieces fit together

- **Create a profile** at `/create.html` → the backend saves it and generates
  a QR code that encodes a link to `/profile/:id`.
- **Scanning the QR** (or opening that link) shows the public emergency profile.
- **"Generate brief"** on the profile page calls `POST /api/ai/brief/:id`,
  which sends the profile to Gemini and asks for a short, calm, first-responder
  -friendly summary.
- **The chat bubble** on the landing page calls `POST /api/ai/chat`, a general
  Gemini-powered assistant for questions about the product.

## Notes before using this for real

- Profiles are currently public to anyone with the link/QR — that's the point
  (so a stranger can help in an emergency), but it means there's no
  authentication. Add login/ownership checks before storing real medical data
  in production.
- `data/profiles.json` is plain-text storage for the demo. Use a real database
  and encryption at rest for production / real personal data.
- Double-check India's and any other relevant jurisdiction's health-data and
  insurance-related regulations before launching something handling real
  medical information commercially.

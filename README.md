# 🛡️ RescueQR — Direct Emergency Medical & Contact Routing

**RescueQR** is a modern, life-saving web application that turns simple QR identification tags (stickers, wallet cards, or wristbands) into dynamic, AI-powered lifelines. When every second counts, RescueQR enables first responders to instantly access critical medical records, contact next-of-kin, and review AI-guided triage briefs.

---

## 🚀 How It Works (Working Flow)

1. **Physical Tag Scan**: A responder scans the patient's physical RescueQR code with any standard smartphone camera. No app installation is required.
2. **GPS Logging**: The loading page requests the responder's GPS permission. Once granted, coordinates are acquired and logged securely.
3. **Automated Family Alerts**: Simultaneously, the backend dispatches automated SMS and email notifications containing a live Google Maps location link to the user's primary emergency contacts.
4. **Zero-Friction Calling**: Responders can view a list of family contacts and tap **Call** next to any contact, immediately launching their phone's native dialer via direct `tel:` routing (no intermediate screens or puzzle modals).
5. **Gemini AI Insights**: Raw medical charts are parsed serverless-side by Google's **Gemini 2.5 Flash** model to generate instant scannable summaries and caregiver preparedness tips.
6. **Emergency Documents Access**: Responders can view and download optional uploaded files (medical cards, prescriptions) directly from the details page.

---

## ⚡ Core Features

*   **⚡ Instant Scans**: 1-second redirection to mobile-optimized web profiles.
*   **📍 GPS & Outbound Dispatch**: Captures location coordinates and texts families in real time.
*   **🧠 Gemini AI Medical Summaries**:
    *   *Emergency Summary*: Scannable 10-second first-responder brief.
    *   *Clinical Briefs*: Structured triage notes for doctors and emergency room staff.
    *   *Caregiver Guidance*: Reassuring checklist guides for worried families.
    *   *Preparedness Scoring*: Dynamic readiness scores & medication/allergy conflict check.
*   **🏥 Direct Native Dialer**: Zero-friction call buttons connecting responders straight to dialer apps.
*   **📁 Emergency Documents**: Optional field allowing users to upload documents (PDF/Images) as Base64 strings, accessible by scanning responders.
*   **🔐 Row-Level Security (RLS)**: Profile metadata is strictly protected in PostgreSQL and is only readable by public responders scanning the physical tag.

---

## 🛠️ Technology Stack

*   **Core Languages**: TypeScript, JavaScript, HTML5, CSS3.
*   **Frontend Framework**: Next.js 15 (React 19, App Router) for fast SSR.
*   **Styling**: Tailwind CSS & custom Vanilla CSS tokens.
*   **Database & Auth**: Supabase (PostgreSQL) with Row-Level Security. Fallback support for LocalStorage is integrated for offline client-only mode.
*   **AI Integration**: Google Generative AI SDK & **OpenRouter API completions gateway** supporting both Google Gemini Keys (`AIzaSy...`) and OpenRouter Keys (`sk-...`).

---

## 💻 Getting Started (Local Development)

### 1. Prerequisites
Ensure you have Node.js 18+ installed on your machine.

### 2. Configure Environment Variables
Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```
Fill in the configuration variables:
```env
# Gemini API Key (Google or OpenRouter key)
GEMINI_API_KEY="your_api_key_here"
GEMINI_MODEL="google/gemini-2.5-flash"

# Supabase Configurations (Optional - defaults to LocalStorage mock DB if blank)
NEXT_PUBLIC_SUPABASE_URL="your_supabase_project_url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_supabase_anon_key"
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 🗄️ Database Setup (Optional)
To run with a real Supabase database, run the SQL script defined in [supabase/schema.sql](supabase/schema.sql) in your Supabase SQL Editor.

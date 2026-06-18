-- Supabase Database Schema for RescueQR

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Emergency Profile
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  profile_photo_url TEXT,
  blood_group VARCHAR(10),
  date_of_birth DATE,
  address TEXT,
  medical_conditions TEXT,
  allergies TEXT,
  current_medications TEXT,
  organ_donor BOOLEAN DEFAULT false,
  insurance_provider TEXT,
  insurance_policy_number TEXT,
  primary_doctor_name TEXT,
  primary_doctor_phone TEXT,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Public access to profiles (for emergency scans - read-only)
CREATE POLICY "Public read access for emergency scan" 
  ON public.profiles FOR SELECT 
  TO anon, authenticated
  USING (true);


-- Emergency Contacts
CREATE TABLE IF NOT EXISTS public.emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  relationship TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on emergency_contacts
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;

-- Emergency Contacts Policies
CREATE POLICY "Users can view contacts for their own profile" 
  ON public.emergency_contacts FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can modify contacts for their own profile" 
  ON public.emergency_contacts FOR ALL 
  USING (auth.uid() = profile_id);

CREATE POLICY "Public read access to emergency contacts for scans" 
  ON public.emergency_contacts FOR SELECT 
  TO anon, authenticated
  USING (true);


-- Scan History & Activity
CREATE TABLE IF NOT EXISTS public.scan_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scanned_at TIMESTAMPTZ DEFAULT NOW(),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  ip_address TEXT,
  user_agent TEXT,
  location_name TEXT
);

-- Enable RLS on scan_logs
ALTER TABLE public.scan_logs ENABLE ROW LEVEL SECURITY;

-- Scan Logs Policies
CREATE POLICY "Users can view scans for their own profile" 
  ON public.scan_logs FOR SELECT 
  USING (auth.uid() = profile_id);

CREATE POLICY "Allow public insert of scan logs" 
  ON public.scan_logs FOR INSERT 
  TO anon, authenticated
  WITH CHECK (true);

-- Admin read access to all scans
CREATE POLICY "Admins can read all scan logs"
  ON public.scan_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() AND profiles.is_premium = true -- or an admin flag
    )
  );


-- Subscriptions / Tier
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tier TEXT DEFAULT 'free', -- 'free', 'premium'
  status TEXT DEFAULT 'active',
  ends_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" 
  ON public.subscriptions FOR SELECT 
  USING (auth.uid() = profile_id);

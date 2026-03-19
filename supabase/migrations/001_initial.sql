-- Restaurants table (extends Supabase auth.users)
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  google_review_url TEXT DEFAULT '',
  social_url TEXT DEFAULT '',
  logo_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads (clients collectés)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  reward TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Rewards (récompenses configurables)
CREATE TABLE public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  probability REAL NOT NULL DEFAULT 0.1,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_leads_restaurant ON public.leads(restaurant_id);
CREATE INDEX idx_rewards_restaurant ON public.rewards(restaurant_id);
CREATE INDEX idx_restaurants_slug ON public.restaurants(slug);

-- RLS (Row Level Security)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;

-- Restaurants: owner can read/update their own row
CREATE POLICY "restaurants_own" ON public.restaurants
  FOR ALL USING (auth.uid() = id);

-- Public read access to restaurants by slug (for client funnel)
CREATE POLICY "restaurants_public_read" ON public.restaurants
  FOR SELECT USING (true);

-- Leads: restaurant owner can read their leads
CREATE POLICY "leads_owner_read" ON public.leads
  FOR SELECT USING (auth.uid() = restaurant_id);

-- Leads: anyone can insert (client funnel)
CREATE POLICY "leads_public_insert" ON public.leads
  FOR INSERT WITH CHECK (true);

-- Rewards: restaurant owner full access
CREATE POLICY "rewards_owner" ON public.rewards
  FOR ALL USING (auth.uid() = restaurant_id);

-- Rewards: public read (for wheel display)
CREATE POLICY "rewards_public_read" ON public.rewards
  FOR SELECT USING (true);

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "logos_owner_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "logos_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

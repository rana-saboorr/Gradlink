-- =============================================================================
-- GRADLINK — COMPLETE SUPABASE DATABASE SETUP
-- Run this ENTIRE script in: Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================================

-- ─── DROP EXISTING TABLES (fresh start) ────────────────────────────────────
DROP TABLE IF EXISTS public.admins       CASCADE;
DROP TABLE IF EXISTS public.team         CASCADE;
DROP TABLE IF EXISTS public.announcements CASCADE;
DROP TABLE IF EXISTS public.services     CASCADE;
DROP TABLE IF EXISTS public.jobs         CASCADE;

-- ─── 1. ADMINS ────────────────────────────────────────────────────────────────
CREATE TABLE public.admins (
  id         SERIAL PRIMARY KEY,
  username   TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  password   TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins_select" ON public.admins FOR SELECT USING (true);
CREATE POLICY "admins_update" ON public.admins FOR UPDATE USING (true);

-- Seed admin account
INSERT INTO public.admins (username, email, password) VALUES
('Gradlink.Admin', 'gardlink.admin@email.com', 'Gradlink.Admin.Choty4959!');

-- ─── 2. TEAM ─────────────────────────────────────────────────────────────────
CREATE TABLE public.team (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  role         TEXT NOT NULL,
  bio          TEXT NOT NULL,
  image        TEXT NOT NULL,
  linkedin_url TEXT,
  twitter_url  TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.team ENABLE ROW LEVEL SECURITY;
CREATE POLICY "team_select" ON public.team FOR SELECT USING (true);
CREATE POLICY "team_insert" ON public.team FOR INSERT WITH CHECK (true);
CREATE POLICY "team_update" ON public.team FOR UPDATE USING (true);
CREATE POLICY "team_delete" ON public.team FOR DELETE USING (true);

-- Seed team
INSERT INTO public.team (name, role, bio, image, linkedin_url, twitter_url) VALUES
('Jane Doe',   'Lead Consultant',             'Expert in international education with 10+ years of experience helping students achieve their dreams.',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop', 'https://linkedin.com', 'https://twitter.com'),
('John Smith', 'Admissions Strategist',       'Former admissions officer at a top 10 UK university. Helps students craft compelling applications.',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop', 'https://linkedin.com', NULL),
('Sarah Lee',  'Visa & Immigration Specialist','Guiding students through complex visa procedures with a 99% success rate across 30+ countries.',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop', 'https://linkedin.com', NULL);

-- ─── 3. ANNOUNCEMENTS ─────────────────────────────────────────────────────────
CREATE TABLE public.announcements (
  id         TEXT PRIMARY KEY,          -- Custom 3-letter + number ID (e.g. glk1, ann19)
  title      TEXT NOT NULL,
  message    TEXT NOT NULL,
  type       TEXT NOT NULL DEFAULT 'info',
  expires    DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ann_select" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "ann_insert" ON public.announcements FOR INSERT WITH CHECK (true);
CREATE POLICY "ann_update" ON public.announcements FOR UPDATE USING (true);
CREATE POLICY "ann_delete" ON public.announcements FOR DELETE USING (true);

-- Seed announcements
INSERT INTO public.announcements (id, title, message, type, expires) VALUES
('glk1',  'Fall 2027 Admissions Open!',       'Start your application process for Fall 2027 today. Early bird discounts available on our premium consulting packages.', 'info',    '2026-12-31'),
('ann5',  'New UK Partner Universities Added', 'We have added 8 new UK universities to our partner network. Schedule a free consultation to learn more about these exciting opportunities.', 'success', '2026-10-01'),
('upd19', 'Visa Processing Time Update',       'UK student visa processing times have been reduced to 3 weeks. Start your application early to secure your spot!', 'warning', '2026-09-01');

-- ─── 4. SERVICES ──────────────────────────────────────────────────────────────
CREATE TABLE public.services (
  id          TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
  title       TEXT NOT NULL,
  icon        TEXT,
  description TEXT NOT NULL,
  features    TEXT[] DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srv_select" ON public.services FOR SELECT USING (true);
CREATE POLICY "srv_insert" ON public.services FOR INSERT WITH CHECK (true);
CREATE POLICY "srv_update" ON public.services FOR UPDATE USING (true);
CREATE POLICY "srv_delete" ON public.services FOR DELETE USING (true);

-- Seed services
INSERT INTO public.services (title, icon, description, features) VALUES
('University Admissions', 'GraduationCap',
  'End-to-end support for applying to top universities worldwide, from course selection to final admission.',
  ARRAY['Course Selection', 'Application Strategy', 'Essay Review', 'Interview Prep', 'Scholarship Guidance']),
('Visa Assistance', 'Passport',
  'Expert guidance on student visa applications with a proven 99% success rate across 30+ countries.',
  ARRAY['Document Checklist', 'Application Filing', 'Mock Interviews', 'Financial Guidance', 'Visa Tracking']),
('Career Counseling', 'Briefcase',
  'Align your educational choices with your long-term career goals through expert guidance and industry insights.',
  ARRAY['Aptitude Testing', 'Industry Insights', 'Resume Building', 'Networking Strategies', '1-on-1 Sessions']);

-- ─── 5. JOBS ──────────────────────────────────────────────────────────────────
CREATE TABLE public.jobs (
  id          SERIAL PRIMARY KEY,
  title       TEXT NOT NULL,
  department  TEXT NOT NULL,
  location    TEXT NOT NULL,
  type        TEXT NOT NULL DEFAULT 'Full-time',
  description TEXT NOT NULL,
  deadline    DATE NOT NULL,
  apply_link  TEXT DEFAULT '/contact',
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "jobs_select" ON public.jobs FOR SELECT USING (true);
CREATE POLICY "jobs_insert" ON public.jobs FOR INSERT WITH CHECK (true);
CREATE POLICY "jobs_update" ON public.jobs FOR UPDATE USING (true);
CREATE POLICY "jobs_delete" ON public.jobs FOR DELETE USING (true);

-- Seed jobs
INSERT INTO public.jobs (title, department, location, type, description, deadline, apply_link) VALUES
('Educational Counselor', 'Consulting', 'London, UK (Remote available)', 'Full-time',
  'We are looking for an experienced Educational Counselor to guide students in their university application process. You will work closely with students to identify the best academic pathways aligned with their goals.',
  '2026-08-30', '/contact'),
('Marketing Manager', 'Marketing', 'New York, USA', 'Full-time',
  'Drive our global marketing initiatives and student outreach programs. You will be responsible for building brand awareness and generating leads across multiple digital channels.',
  '2026-09-15', '/contact'),
('Visa Consultant', 'Immigration', 'Dubai, UAE (Hybrid)', 'Full-time',
  'Assist students with their visa applications and ensure a smooth documentation process. Must have knowledge of student visa requirements for UK, USA, Canada, and Australia.',
  '2026-10-01', '/contact');

-- ─── 6. SUPABASE STORAGE BUCKET FOR TEAM IMAGES ───────────────────────────────
INSERT INTO storage.buckets (id, name, public) 
VALUES ('team-images', 'team-images', true) 
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "team_images_select" ON storage.objects;
DROP POLICY IF EXISTS "team_images_insert" ON storage.objects;
DROP POLICY IF EXISTS "team_images_update" ON storage.objects;
DROP POLICY IF EXISTS "team_images_delete" ON storage.objects;

CREATE POLICY "team_images_select" ON storage.objects FOR SELECT USING (bucket_id = 'team-images');
CREATE POLICY "team_images_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'team-images');
CREATE POLICY "team_images_update" ON storage.objects FOR UPDATE USING (bucket_id = 'team-images');
CREATE POLICY "team_images_delete" ON storage.objects FOR DELETE USING (bucket_id = 'team-images');

-- ─── 7. GRANT PERMISSIONS TO ANON ROLE ────────────────────────────────────────
GRANT SELECT, UPDATE                 ON public.admins        TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.team          TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.announcements TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services      TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs          TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =============================================================================
-- ✅ DONE! All 5 tables, RLS policies, seed data, storage bucket, and grants
--    have been created. Your Gradlink backend is fully operational.
-- =============================================================================

-- Schema Additions for Admin, Quiz, and Progress Features
-- Run this in Supabase SQL Editor AFTER the main supabase_schema.sql

-- ==========================================
-- 1. ADD ADMIN FLAG TO PROFILES
-- ==========================================
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- ==========================================
-- 2. QUIZ QUESTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id uuid REFERENCES public.lessons NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL, -- ["Option A", "Option B", "Option C", "Option D"]
  correct_index integer NOT NULL, -- 0-3
  "order" integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for quiz_questions
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Everyone can view quiz questions
CREATE POLICY "Quiz questions viewable by everyone" 
  ON quiz_questions FOR SELECT 
  USING (true);

-- Admins can manage quiz questions
CREATE POLICY "Admins can insert quiz questions" 
  ON quiz_questions FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update quiz questions" 
  ON quiz_questions FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete quiz questions" 
  ON quiz_questions FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 3. ADMIN POLICIES FOR LESSONS
-- ==========================================
CREATE POLICY "Admins can insert lessons" 
  ON lessons FOR INSERT 
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can update lessons" 
  ON lessons FOR UPDATE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

CREATE POLICY "Admins can delete lessons" 
  ON lessons FOR DELETE 
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
  );

-- ==========================================
-- 4. MAKE YOURSELF AN ADMIN
-- ==========================================
-- After running this script, run the following with your email:
-- UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

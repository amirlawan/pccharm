-- RESET Quiz Schema
-- Use this script to DROP existing quiz tables and recreate them to ensure the schema is correct.
-- WARNING: This will delete all existing quiz data.

-- 1. Drop tables in reverse dependency order
DROP TABLE IF EXISTS public.quiz_options;
DROP TABLE IF EXISTS public.quiz_questions;
DROP TABLE IF EXISTS public.quizzes;

-- 2. Recreate tables
-- Create quizzes table
CREATE TABLE public.quizzes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id text REFERENCES public.courses NOT NULL,
  title text NOT NULL,
  description text,
  module_id text NOT NULL, -- Logical link to the module (e.g., 'module-1')
  "order" integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quiz_questions table
CREATE TABLE public.quiz_questions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id uuid REFERENCES public.quizzes ON DELETE CASCADE NOT NULL,
  question_text text NOT NULL,
  explanation text,
  "order" integer NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create quiz_options table
CREATE TABLE public.quiz_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id uuid REFERENCES public.quiz_questions ON DELETE CASCADE NOT NULL,
  option_text text NOT NULL,
  is_correct boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
-- Quizzes: Viewable by everyone
CREATE POLICY "Quizzes are viewable by everyone" 
  ON public.quizzes FOR SELECT 
  USING (true);

-- Questions: Viewable by everyone
CREATE POLICY "Questions are viewable by everyone" 
  ON public.quiz_questions FOR SELECT 
  USING (true);

-- Options: Viewable by everyone
CREATE POLICY "Options are viewable by everyone" 
  ON public.quiz_options FOR SELECT 
  USING (true);

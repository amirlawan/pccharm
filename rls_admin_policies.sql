-- =======================================================================
-- PCCharm Database Security Migration: Row Level Security (RLS) Policies
-- Run this in your Supabase SQL Editor to enforce server-side security.
-- =======================================================================

-- 1. Enable RLS on all administrative tables
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_waitlist ENABLE ROW LEVEL SECURITY;

-- 2. profiles table helper policy functions
-- Helper check function: checks if a user is an administrator
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean SECURITY DEFINER AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql;

-- 3. RLS Policies for public.courses
DROP POLICY IF EXISTS "Courses are viewable by everyone." ON public.courses;
CREATE POLICY "Courses are viewable by everyone." 
  ON public.courses FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert courses" 
  ON public.courses FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update courses" 
  ON public.courses FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete courses" 
  ON public.courses FOR DELETE 
  USING (public.is_admin());

-- 4. RLS Policies for public.lessons
DROP POLICY IF EXISTS "Lessons are viewable by everyone." ON public.lessons;
CREATE POLICY "Lessons are viewable by everyone." 
  ON public.lessons FOR SELECT 
  USING (true);

CREATE POLICY "Admins can insert lessons" 
  ON public.lessons FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update lessons" 
  ON public.lessons FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete lessons" 
  ON public.lessons FOR DELETE 
  USING (public.is_admin());

-- 5. RLS Policies for public.announcements
DROP POLICY IF EXISTS "Announcements are viewable by everyone" ON public.announcements;
CREATE POLICY "Announcements are viewable by everyone" 
  ON public.announcements FOR SELECT 
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert announcements" 
  ON public.announcements FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update announcements" 
  ON public.announcements FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete announcements" 
  ON public.announcements FOR DELETE 
  USING (public.is_admin());

-- 6. RLS Policies for public.notifications
DROP POLICY IF EXISTS "Notifications are viewable by target users" ON public.notifications;
CREATE POLICY "Notifications are viewable by target users" 
  ON public.notifications FOR SELECT 
  USING (
    target_type = 'all' 
    OR (target_type = 'specific' AND target_value = auth.uid()::text)
    OR public.is_admin()
  );

CREATE POLICY "Admins can insert notifications" 
  ON public.notifications FOR INSERT 
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update notifications" 
  ON public.notifications FOR UPDATE 
  USING (public.is_admin());

CREATE POLICY "Admins can delete notifications" 
  ON public.notifications FOR DELETE 
  USING (public.is_admin());

-- 7. RLS Policies for public.course_waitlist
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.course_waitlist;
CREATE POLICY "Anyone can join waitlist" 
  ON public.course_waitlist FOR INSERT 
  WITH CHECK (true);

DROP POLICY IF EXISTS "Admins can view waitlist" ON public.course_waitlist;
CREATE POLICY "Admins can view waitlist" 
  ON public.course_waitlist FOR SELECT 
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete waitlist entries" ON public.course_waitlist;
CREATE POLICY "Admins can delete waitlist entries" 
  ON public.course_waitlist FOR DELETE 
  USING (public.is_admin());

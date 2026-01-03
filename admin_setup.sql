-- EASY ADMIN SETUP
-- Run this in Supabase SQL Editor to make yourself an admin

-- Step 1: Add is_admin column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Step 2: Make your account an admin (REPLACE WITH YOUR EMAIL!)
-- Copy one of these and change the email to yours:

-- Option A: If you know your email
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
    SELECT id FROM auth.users 
    WHERE email = 'YOUR_EMAIL_HERE@example.com'
);

-- Option B: Make ALL existing users admin (for testing only!)
-- UPDATE public.profiles SET is_admin = true;

-- Step 3: Verify it worked
SELECT p.id, u.email, p.is_admin 
FROM profiles p 
JOIN auth.users u ON p.id = u.id;

-- If the above shows nothing, your profile might not exist.
-- Run this to create it:
-- INSERT INTO profiles (id, full_name, is_admin)
-- SELECT id, raw_user_meta_data->>'full_name', true
-- FROM auth.users
-- WHERE email = 'YOUR_EMAIL_HERE@example.com'
-- ON CONFLICT (id) DO UPDATE SET is_admin = true;

-- Phase 1: Fix Profiles RLS Policies

-- Drop the insecure policy that exposes all profiles to all users
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Admin can see all profiles (for employee management)
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Users can see only their own profile
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create secure function to lookup employee names without exposing full profiles
CREATE OR REPLACE FUNCTION public.get_profile_name(lookup_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT full_name FROM profiles WHERE user_id = lookup_user_id
$$;
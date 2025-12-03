/*
  # Implement Strict Role-Based Access Control (RBAC)
  
  ## Critical Security Fixes
  
  This migration addresses critical data exposure vulnerabilities by implementing
  comprehensive Row Level Security (RLS) policies that enforce role-based access control.
  
  ## Security Issues Fixed
  
  1. **Email Address Exposure**: Employees could view all user email addresses
  2. **Work Item Access**: All policies are already correctly restrictive
  3. **Profile Data Leakage**: Any authenticated user could access all profiles
  
  ## Changes Made
  
  ### 1. Profiles Table - Strict Access Control
  - **REMOVED**: Permissive policy allowing all users to view all profiles
  - **ADDED**: 
    - Admins can view all profiles (for management purposes)
    - Employees can ONLY view their own profile
    - Users can only update their own profile (unchanged)
    - Users can only insert their own profile (unchanged)
  
  ### 2. Work Items Table
  - Policies already correct - no changes needed
  - Employees can only see/update assigned items
  - Admins have full access
  
  ### 3. User Roles Table
  - Policies already correct - no changes needed
  - Users can only see their own role
  - Admins can manage all roles
  
  ### 4. Chat Messages Table  
  - Policies already correct - no changes needed
  - All authenticated users can view messages (team collaboration)
  - Users can only post/delete their own messages
  
  ## Security Guarantees
  
  After this migration:
  - Employees CANNOT access email addresses of other users
  - Employees CANNOT view profiles of other users
  - Employees CANNOT access work items not assigned to them
  - All database queries enforce these restrictions automatically
  - Direct API calls cannot bypass these security rules
*/

-- Drop the overly permissive profile viewing policy
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;

-- Create strict role-based policies for profile access
-- Admin users can view all profiles (needed for employee management)
CREATE POLICY "Admins can view all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Employees can ONLY view their own profile (prevents email enumeration)
CREATE POLICY "Employees can view own profile only"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Ensure admins can manage profiles (for user management)
CREATE POLICY "Admins can update all profiles"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Add policy to allow admins to delete user profiles
CREATE POLICY "Admins can delete profiles"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for performance on role-based queries
CREATE INDEX IF NOT EXISTS idx_work_items_assigned_employee 
  ON work_items(assigned_employee_id) 
  WHERE assigned_employee_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_user_id 
  ON profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id 
  ON user_roles(user_id);

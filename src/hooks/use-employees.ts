import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";
import { AppRole } from "@/hooks/use-auth";

export interface Employee {
  user_id: string;
  full_name: string;
  email: string;
  role: AppRole;
}

/**
 * Admin-only hook to fetch full employee data including emails.
 * Non-admins will receive an empty array (enforced by RLS).
 */
export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuthContext();

  const fetchEmployees = useCallback(async () => {
    // Only admins should fetch employees - RLS enforces this at DB level too
    if (!isAdmin) {
      setEmployees([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("user_id, full_name, email");

    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      setLoading(false);
      return;
    }

    const { data: roles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id, role");

    if (rolesError) {
      console.error("Error fetching roles:", rolesError);
      setLoading(false);
      return;
    }

    const roleMap = new Map(roles?.map((r) => [r.user_id, r.role as AppRole]));

    const employeesData: Employee[] = (profiles || []).map((profile) => ({
      user_id: profile.user_id,
      full_name: profile.full_name,
      email: profile.email,
      role: roleMap.get(profile.user_id) || "employee",
    }));

    setEmployees(employeesData);
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const updateRole = async (userId: string, newRole: AppRole) => {
    if (!isAdmin) return { error: new Error("Unauthorized") };

    const { error } = await supabase
      .from("user_roles")
      .update({ role: newRole })
      .eq("user_id", userId);

    if (!error) {
      await fetchEmployees();
    }
    return { error };
  };

  const deleteUser = async (userId: string) => {
    if (!isAdmin) return { error: new Error("Unauthorized - Admin only") };

    // Delete from profiles (cascade will handle user_roles)
    const { error } = await supabase.from("profiles").delete().eq("user_id", userId);

    if (!error) {
      await fetchEmployees();
    }
    return { error };
  };

  return {
    employees,
    loading,
    refetch: fetchEmployees,
    updateRole,
    deleteUser,
  };
}

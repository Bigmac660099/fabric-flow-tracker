import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface EmployeeName {
  user_id: string;
  full_name: string;
}

/**
 * Secure hook to fetch employee names without exposing emails or full employee list.
 * Uses a security definer function to bypass RLS restrictions safely.
 */
export function useEmployeeNames(userIds: string[]) {
  const [employeeNames, setEmployeeNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(false);

  const fetchNames = useCallback(async () => {
    if (userIds.length === 0) {
      setEmployeeNames(new Map());
      return;
    }

    setLoading(true);
    const uniqueIds = [...new Set(userIds.filter(Boolean))];
    const namesMap = new Map<string, string>();

    // Fetch names using the secure database function
    for (const userId of uniqueIds) {
      const { data, error } = await supabase.rpc("get_profile_name", {
        lookup_user_id: userId,
      });

      if (!error && data) {
        namesMap.set(userId, data);
      }
    }

    setEmployeeNames(namesMap);
    setLoading(false);
  }, [userIds.join(",")]);

  useEffect(() => {
    fetchNames();
  }, [fetchNames]);

  const getEmployeeName = useCallback(
    (userId: string | null): string => {
      if (!userId) return "Unassigned";
      return employeeNames.get(userId) || "Unknown";
    },
    [employeeNames]
  );

  return {
    employeeNames,
    getEmployeeName,
    loading,
    refetch: fetchNames,
  };
}

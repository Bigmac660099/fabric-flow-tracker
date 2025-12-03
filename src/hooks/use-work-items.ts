import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface WorkItem {
  id: string;
  order_id: string;
  client_name: string;
  quantity: number;
  progress_stage: string;
  notes: string | null;
  assigned_employee_id: string | null;
  cutting_date: string | null;
  printing_date: string | null;
  sewing_date: string | null;
  finishing_date: string | null;
  packing_date: string | null;
  delivery_date: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export const PROGRESS_STAGES = [
  "Cutting",
  "Printing",
  "Sewing",
  "Finishing",
  "Packing",
  "Delivery",
] as const;

export type ProgressStage = (typeof PROGRESS_STAGES)[number];

export function useWorkItems() {
  const [workItems, setWorkItems] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthContext();

  const fetchWorkItems = useCallback(async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("work_items")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching work items:", error);
    } else {
      setWorkItems(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  const createWorkItem = async (item: Partial<WorkItem>) => {
    if (!user || !isAdmin) return { error: new Error("Unauthorized") };

    const { error } = await supabase.from("work_items").insert([{
      order_id: item.order_id || "",
      client_name: item.client_name || "",
      quantity: item.quantity || 1,
      progress_stage: item.progress_stage || "Cutting",
      notes: item.notes || null,
      assigned_employee_id: item.assigned_employee_id || null,
      created_by: user.id,
    }]);

    if (!error) {
      await fetchWorkItems();
    }
    return { error };
  };

  const updateWorkItem = async (id: string, updates: Partial<WorkItem>) => {
    if (!user) return { error: new Error("Unauthorized") };

    const { error } = await supabase
      .from("work_items")
      .update(updates)
      .eq("id", id);

    if (!error) {
      await fetchWorkItems();
    }
    return { error };
  };

  const deleteWorkItem = async (id: string) => {
    if (!user || !isAdmin) return { error: new Error("Unauthorized") };

    const { error } = await supabase.from("work_items").delete().eq("id", id);

    if (!error) {
      await fetchWorkItems();
    }
    return { error };
  };

  const getStageStats = () => {
    const stats: Record<ProgressStage, number> = {
      Cutting: 0,
      Printing: 0,
      Sewing: 0,
      Finishing: 0,
      Packing: 0,
      Delivery: 0,
    };

    workItems.forEach((item) => {
      if (item.progress_stage in stats) {
        stats[item.progress_stage as ProgressStage]++;
      }
    });

    return stats;
  };

  return {
    workItems,
    loading,
    createWorkItem,
    updateWorkItem,
    deleteWorkItem,
    refetch: fetchWorkItems,
    getStageStats,
  };
}

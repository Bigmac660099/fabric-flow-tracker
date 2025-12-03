import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: {
    full_name: string;
    email: string;
  };
}

export function useTeamChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthContext();

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      // Fetch profiles separately
      const userIds = [...new Set(data?.map((m) => m.user_id) || [])];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, email")
        .in("user_id", userIds);

      const profileMap = new Map(profiles?.map((p) => [p.user_id, p]));
      const messagesWithProfiles = (data || []).map((msg) => ({
        ...msg,
        profile: profileMap.get(msg.user_id),
      }));

      setMessages(messagesWithProfiles);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("chat_messages_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "chat_messages",
        },
        () => {
          fetchMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  const sendMessage = async (message: string) => {
    if (!user || !message.trim()) return { error: new Error("Invalid message") };

    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      message: message.trim(),
    });

    return { error };
  };

  const deleteMessage = async (id: string) => {
    if (!user) return { error: new Error("Unauthorized") };

    const { error } = await supabase.from("chat_messages").delete().eq("id", id);

    return { error };
  };

  return {
    messages,
    loading,
    sendMessage,
    deleteMessage,
    isAdmin,
  };
}

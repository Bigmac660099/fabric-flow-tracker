import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/contexts/AuthContext";

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  author_name: string;
}

export function useTeamChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuthContext();

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("id, user_id, message, created_at, author_name")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data || []);
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

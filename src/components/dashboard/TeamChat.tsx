import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTeamChat } from "@/hooks/use-team-chat";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export function TeamChat() {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { messages, loading, sendMessage, deleteMessage, isAdmin } = useTeamChat();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    const { error } = await sendMessage(newMessage);
    setSending(false);

    if (error) {
      toast({ title: "Failed to send message", variant: "destructive" });
    } else {
      setNewMessage("");
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteMessage(id);
    if (error) {
      toast({ title: "Failed to delete message", variant: "destructive" });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="h-[400px] flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          Team Chat
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden p-4 pt-0">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          {loading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isOwn = msg.user_id === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${isOwn ? "flex-row-reverse" : ""}`}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs">
                        {getInitials(msg.profile?.full_name || "U")}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`flex flex-col ${isOwn ? "items-end" : ""}`}>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{msg.profile?.full_name || "User"}</span>
                        <span>{format(new Date(msg.created_at), "HH:mm")}</span>
                      </div>
                      <div
                        className={`mt-1 rounded-lg px-3 py-2 max-w-[250px] break-words ${
                          isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        {msg.message}
                      </div>
                      {(isOwn || isAdmin) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(msg.id)}
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSend} className="flex gap-2 mt-4">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

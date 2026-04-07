"use client";

import { useState, useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatInput from "@/components/ChatInput";
import ChatMessageSkeleton from "@/components/ChatMessageSkeleton";
import { ChefHat, AlertCircle } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleSend = async (message: string) => {
    if (!message.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const abortController = new AbortController();
    abortRef.current = abortController;

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
        signal: abortController.signal,
      });

      if (!response.ok) throw new Error("Failed to get response");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };

      setMessages((prev) => [...prev, assistantMessage]);

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: accumulated }
              : msg,
          ),
        );
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      <ScrollArea className="flex-1 px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <ChefHat className="mb-4 h-16 w-16 text-muted-foreground" />
              <h2 className="text-2xl font-semibold">AI Chef Assistant</h2>
              <p className="mt-2 text-muted-foreground">
                Ask for recipe suggestions, cooking tips, or dietary advice
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {message.role === "user" ? (
                    "U"
                  ) : (
                    <ChefHat className="h-4 w-4" />
                  )}
                </AvatarFallback>
              </Avatar>
              <div
                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="whitespace-pre-wrap text-sm">{message.content}</p>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role !== "user" && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <ChefHat className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <ChatMessageSkeleton />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error.message ||
                  "The AI service encountered an error. Please refresh the page to try again."}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <ChatInput
          input={input}
          onInputChange={setInput}
          onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            handleSend(input);
          }}
          isStreaming={isLoading}
          onStop={async () => {
            abortRef.current?.abort();
          }}
        />
      </div>
    </div>
  );
}

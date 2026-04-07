"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ChatInput from "./ChatInput";
import ChatMessageSkeleton from "./ChatMessageSkeleton";
import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";
import { useState, useCallback } from "react";

interface ChatInterfaceProps {
  initialMessage?: string;
  className?: string;
}

function extractText(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

export default function ChatInterface({
  initialMessage,
  className,
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");

  const transport = new DefaultChatTransport<UIMessage>({
    api: "/api/ai/chat",
  });

  const initialMessages: UIMessage[] = initialMessage
    ? [
        {
          id: "init",
          role: "user" as const,
          parts: [{ type: "text" as const, text: initialMessage }],
        },
      ]
    : [];

  const { messages, sendMessage, stop, status, error } = useChat<UIMessage>({
    transport,
    messages: initialMessages,
    onError: (err: Error) => {
      console.error("Chat error:", err);
    },
  });

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (
        !inputValue.trim() ||
        status === "streaming" ||
        status === "submitted"
      )
        return;
      sendMessage({ text: inputValue.trim() });
      setInputValue("");
    },
    [inputValue, sendMessage, status],
  );

  const isStreaming = status === "streaming" || status === "submitted";

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <ScrollArea className="flex-1 px-4">
        <div className="flex flex-col gap-4 py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bot className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">Ask CookLens anything</p>
              <p className="text-sm text-muted-foreground">
                Get cooking tips, recipe suggestions, or ingredient
                substitutions.
              </p>
            </div>
          )}

          {messages.map((message) => {
            const text = extractText(message);
            if (!text) return null;

            return (
              <div
                key={message.id}
                className={cn(
                  "flex items-start gap-3",
                  message.role === "user" ? "flex-row-reverse" : "flex-row",
                )}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback
                    className={cn(
                      "text-xs",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2 text-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground",
                  )}
                >
                  {text}
                </div>
              </div>
            );
          })}

          {isStreaming &&
            messages.length > 0 &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="max-w-[80%] rounded-lg px-4 py-2">
                  <ChatMessageSkeleton />
                </div>
              </div>
            )}

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error.message || "An error occurred. Please try again."}
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput
        input={inputValue}
        onInputChange={setInputValue}
        onSubmit={handleSubmit}
        isStreaming={isStreaming}
        onStop={stop}
        className="border-t p-4"
      />
    </div>
  );
}

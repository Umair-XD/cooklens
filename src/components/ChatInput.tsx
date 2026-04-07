"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Square } from "lucide-react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isStreaming: boolean;
  onStop?: () => Promise<void>;
  className?: string;
  placeholder?: string;
}

export default function ChatInput({
  input,
  onInputChange,
  onSubmit,
  isStreaming,
  onStop,
  className,
  placeholder = "Ask about cooking, ingredients, or recipes...",
}: ChatInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isStreaming) {
        onSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className={cn("flex items-end gap-2", className)}>
      <Textarea
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[44px] max-h-32 flex-1 resize-none"
        rows={1}
        disabled={isStreaming}
      />
      {isStreaming && onStop ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onStop}
          className="shrink-0"
          aria-label="Stop generating"
        >
          <Square className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim()}
          className="shrink-0"
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      )}
    </form>
  );
}

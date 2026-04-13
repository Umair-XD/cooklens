"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Square, Plus } from "lucide-react";
import { useRef, useEffect } from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent, attachments?: FileList) => void;
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
  placeholder = "Message Chef Assistant...",
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || (fileInputRef.current?.files?.length ?? 0) > 0) && !isStreaming) {
        onSubmit(e as unknown as React.FormEvent, fileInputRef.current?.files || undefined);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  return (
    <div className={cn("relative flex items-end gap-2 p-2", className)}>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        multiple
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleFileClick}
        className="h-10 w-10 shrink-0 rounded-xl hover:bg-muted font-bold"
        aria-label="Add attachment"
      >
        <Plus className="h-5 w-5 text-muted-foreground" />
      </Button>

      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => onInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="min-h-[44px] max-h-40 flex-1 resize-none bg-transparent border-none focus-visible:ring-0 px-2 py-3 text-sm font-medium placeholder:text-muted-foreground/50 transition-all custom-scrollbar"
        rows={1}
        disabled={isStreaming}
      />
      
      <div className="flex gap-1.5 h-10 items-center px-1">
        {isStreaming && onStop ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onStop}
            className="h-10 w-10 shrink-0 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 transition-all"
            aria-label="Stop generating"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        ) : (
          <Button
            type="submit"
            size="icon"
            disabled={!input?.trim() && (fileInputRef.current?.files?.length ?? 0) === 0}
            onClick={(e) => {
              e.preventDefault();
              if (!isStreaming) {
                onSubmit(e, fileInputRef.current?.files || undefined);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }
            }}
            className={cn(
               "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
               (!input?.trim() && (fileInputRef.current?.files?.length ?? 0) === 0) ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
            )}
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

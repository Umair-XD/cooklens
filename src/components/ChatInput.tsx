"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Square, Plus, X } from "lucide-react";
import { useRef, useEffect, useState } from "react";

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
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if ((input.trim() || selectedFiles.length > 0) && !isStreaming) {
        submitMessage(e as unknown as React.FormEvent);
      }
    }
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setSelectedFiles((prev) => [...prev, ...files]);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
    
    // Clear the input so identical files can be picked again if removed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      URL.revokeObjectURL(prev[index]);
      return newUrls;
    });
  };

  const submitMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStreaming) {
      // Create a fake FileList-like construct or pass files if needed, but modern useChat allows passing an array or custom DataTransfer
      const dt = new DataTransfer();
      selectedFiles.forEach(f => dt.items.add(f));
      
      onSubmit(e, dt.files);
      
      // Cleanup
      setSelectedFiles([]);
      previewUrls.forEach(URL.revokeObjectURL);
      setPreviewUrls([]);
    }
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
        onChange={handleFileChange}
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

      <div className="flex-1 flex flex-col min-h-[44px]">
        {previewUrls.length > 0 && (
          <div className="flex gap-2 p-2 overflow-x-auto pb-1 mt-1">
            {previewUrls.map((url, i) => (
              <div key={i} className="relative shrink-0 group/preview transition-transform animate-in fade-in zoom-in-95">
                <img 
                  src={url} 
                  alt="Attachment preview" 
                  className="h-16 w-16 object-cover rounded-xl border border-border/50 shadow-sm" 
                />
                <button
                  onClick={() => removeFile(i)}
                  className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 shadow-sm opacity-0 group-hover/preview:opacity-100 transition-opacity focus:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="min-h-[44px] max-h-40 w-full resize-none bg-transparent border-none focus-visible:ring-0 px-2 py-3 text-sm font-medium placeholder:text-muted-foreground/50 transition-all custom-scrollbar"
          rows={1}
          disabled={isStreaming}
        />
      </div>
      
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
            disabled={!input?.trim() && selectedFiles.length === 0}
            onClick={submitMessage}
            className={cn(
               "h-10 w-10 shrink-0 rounded-xl transition-all duration-300",
               (!input?.trim() && selectedFiles.length === 0) ? "bg-muted text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
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

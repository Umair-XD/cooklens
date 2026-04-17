"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Send, Square, Plus, X, Image as ImageIcon, Paperclip } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

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
  placeholder = "Ask anything about cooking...",
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
    
    // Add new files to existing ones
    setSelectedFiles((prev) => [...prev, ...files]);

    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls((prev) => [...prev, ...urls]);
    
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
    if (!isStreaming && (input.trim() || selectedFiles.length > 0)) {
      const dt = new DataTransfer();
      selectedFiles.forEach(f => dt.items.add(f));
      
      onSubmit(e, dt.files);
      
      setSelectedFiles([]);
      previewUrls.forEach(URL.revokeObjectURL);
      setPreviewUrls([]);
      
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <TooltipProvider>
      <div className={cn("relative w-full max-w-4xl mx-auto px-4 pb-4 bg-transparent", className)}>
        <div className="relative flex flex-col w-full bg-card/60 backdrop-blur-xl border border-border/50 shadow-2xl rounded-[1.5rem] transition-all duration-300 ring-offset-background focus-within:ring-2 focus-within:ring-primary/10 focus-within:border-primary/20 overflow-hidden">
          
          {/* File Previews */}
          {previewUrls.length > 0 && (
            <div className="flex gap-3 px-4 pt-4 overflow-x-auto no-scrollbar scroll-smooth">
              {previewUrls.map((url, i) => (
                <div key={i} className="relative group shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border/50 shadow-sm ring-2 ring-transparent group-hover:ring-primary/30 transition-all">
                    <img 
                      src={url} 
                      alt="Preview" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110 active:scale-90 z-20 focus:outline-hidden"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 p-2 focus-within:outline-hidden">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              multiple
            />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleFileClick}
                  className="h-10 w-10 shrink-0 rounded-xl hover:bg-muted/50 transition-colors focus-visible:ring-0 focus-visible:ring-offset-0"
                >
                  <Paperclip className="h-5 w-5 text-muted-foreground/70" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Attach images</TooltipContent>
            </Tooltip>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[44px] max-h-[200px] w-full resize-none bg-transparent border-none focus-visible:ring-0 px-2 py-3 text-base leading-relaxed placeholder:text-muted-foreground/40 transition-all"
              rows={1}
              disabled={isStreaming}
            />
            
            <div className="flex items-center pb-1 pr-1">
              {isStreaming ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={onStop}
                      className="h-10 w-10 shrink-0 rounded-xl shadow-lg shadow-destructive/20 animate-in zoom-in-75 focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      <Square className="h-4 w-4 fill-current text-white" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">Stop generating</TooltipContent>
                </Tooltip>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() && selectedFiles.length === 0}
                  onClick={submitMessage}
                  className={cn(
                    "h-10 w-10 shrink-0 rounded-xl transition-all duration-500 focus-visible:ring-0 focus-visible:ring-offset-0",
                    (!input.trim() && selectedFiles.length === 0)
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105 active:scale-95"
                  )}
                >
                  <Send className={cn("h-4 w-4 transition-transform", input.trim() && "translate-x-0.5 -translate-y-0.5")} />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-2 text-center pb-2">
          <p className="text-[11px] text-muted-foreground/50 font-medium tracking-tight">
            Chef Lens AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </TooltipProvider>
  );
}

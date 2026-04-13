"use client";

import { useRef, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatInput from "@/components/ChatInput";
import ChatMessageSkeleton from "@/components/ChatMessageSkeleton";
import { ChefHat, AlertCircle, Sparkles, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  const { messages, input, setInput, handleSubmit, isLoading, error, stop, reload } = useChat({
    api: "/api/ai/chat",
  });
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isLoading]);

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-background/50">
      <ScrollArea ref={scrollRef} className="flex-1 px-4">
        <div className="mx-auto max-w-3xl py-10 space-y-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="relative mb-6">
                 <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
                 <div className="relative p-5 rounded-3xl bg-primary/10 text-primary border border-primary/20">
                   <ChefHat className="h-12 w-12" />
                 </div>
              </div>
              <h2 className="text-3xl font-bold tracking-tight mb-2">AI Culinary Assistant</h2>
              <p className="text-muted-foreground max-w-sm">
                Your personal sous-chef. Ask me for recipe tweaks, meal ideas, or nutritional advice.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-10 w-full max-w-md text-left">
                {[
                  "How do I make a keto breakfast?",
                  "Give me a 15-min dinner idea",
                  "What's a good substitute for eggs?",
                  "Explain macros like I'm five"
                ].map((tip) => (
                  <button 
                    key={tip}
                    onClick={() => setInput(tip)}
                    className="p-3 text-xs font-semibold rounded-xl border border-border/50 bg-card/40 hover:bg-primary/5 hover:border-primary/30 transition-all text-left group"
                  >
                    <span className="flex items-center gap-2">
                       <Sparkles className="h-3 w-3 text-primary opacity-50 group-hover:opacity-100" />
                       {tip}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, i) => (
            <div
              key={message.id}
              className={cn(
                "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                message.role === "user" ? "flex-row-reverse" : ""
              )}
            >
              <Avatar className={cn(
                "h-9 w-9 border shadow-sm",
                message.role === "user" ? "bg-primary/10" : "bg-card glass"
              )}>
                <AvatarFallback className="text-xs font-bold">
                  {message.role === "user" ? (
                    <User className="h-4 w-4 text-primary" />
                  ) : (
                    <ChefHat className="h-4 w-4 text-primary" />
                  )}
                </AvatarFallback>
              </Avatar>
              
              <div
                className={cn(
                  "relative rounded-2xl px-5 py-3.5 max-w-[85%] shadow-premium text-sm leading-relaxed",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground font-medium rounded-tr-none"
                    : "bg-card border border-border/50 glass rounded-tl-none"
                )}
              >
                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-start gap-4">
              <Avatar className="h-9 w-9 bg-card glass border shadow-sm">
                <AvatarFallback>
                  <ChefHat className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border border-border/50 glass rounded-2xl rounded-tl-none px-5 py-4 w-full max-w-[200px] shadow-premium">
                <ChatMessageSkeleton lines={2} />
              </div>
            </div>
          )}

          {error && (
            <Alert variant="destructive" className="rounded-2xl bg-destructive/5 border-destructive/20 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs font-semibold">
                {error.message || "Connection lost. Please try again."}
                <button 
                  onClick={() => reload()} 
                  className="ml-2 underline hover:no-underline"
                >
                  Retry
                </button>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 sm:p-6 bg-gradient-to-t from-background to-transparent">
        <div className="mx-auto max-w-3xl">
          <div className="mb-2 flex items-center gap-1.5 px-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              AI Powered Culinary Engine
            </span>
          </div>
          <ChatInput
            input={input}
            onInputChange={setInput}
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit(e);
            }}
            isStreaming={isLoading}
            onStop={async () => stop()}
            className="glass shadow-premium border-border/50 rounded-2xl overflow-hidden p-1 gap-1"
          />
          <div className="mt-2 text-center">
            <p className="text-[10px] text-muted-foreground/40">
              AI can make mistakes. Always verify recipe safety and measurements.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

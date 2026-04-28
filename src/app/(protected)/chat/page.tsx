"use client";

import { useRef, useEffect, useState, useMemo, memo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatInput from "@/components/ChatInput";
import { ChefHat, AlertCircle, Sparkles, User, Copy, Check, RotateCcw, ArrowDown, Zap, UtensilsCrossed, Soup } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface RecipeChatContext {
  id: string;
  name: string;
  cuisineType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  servings: number;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  utensils: string[];
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  steps: Array<{
    stepNumber: number;
    instruction: string;
  }>;
  nutrition: {
    caloriesPerServing: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
}

// Separate memoized component for each message to maximize efficiency
  const ChatMessage = memo(({ 
  message, 
  isLast, 
  isStreaming, 
  isLoading, 
  onCopy, 
  copiedId, 
  onRegenerate 
}: { 
  message: UIMessage; 
  isLast: boolean; 
  isStreaming: boolean; 
  isLoading: boolean;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onRegenerate: () => void;
}) => {
  const isUser = (message.role as string) === "user";
  const shouldStream = isLast && isStreaming && !isUser;
  
  return (
    <div
      className={cn(
        "flex items-start gap-3 md:gap-5 group/msg animate-in fade-in slide-in-from-bottom-4 duration-500",
        isUser ? "flex-row-reverse" : "flex-row",
      )}
    >
      <div className="shrink-0 mt-1">
        <Avatar className={cn(
          "h-10 w-10 border shadow-md transition-all duration-300",
          isUser ? "bg-primary border-primary/20" : "bg-card border-border/50 glass"
        )}>
          <AvatarFallback className={cn("text-xs font-bold", isUser ? "text-primary-foreground" : "text-primary")}>
            {isUser ? <User className="h-5 w-5" /> : <ChefHat className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className={cn(
        "relative flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "relative rounded-3xl px-5 py-4 shadow-sm text-base leading-relaxed wrap-break-word",
          isUser 
            ? "bg-primary text-primary-foreground font-medium rounded-tr-none shadow-primary/20" 
            : "bg-card/50 border border-border/40 backdrop-blur-md rounded-tl-none"
        )}>
          <div className="prose prose-sm dark:prose-invert max-w-none font-medium prose-p:my-1 prose-headings:mt-4 prose-headings:mb-2 prose-ul:my-1 prose-li:my-0 prose-pre:my-2">
            {(message.parts as any[]).map((part: any, partIdx: number) => {
              if (part.type === "text") {
                return (
                  <div key={partIdx} className="w-full">
                    <Streamdown mode={shouldStream ? "streaming" : "static"}>
                      {part.text}
                    </Streamdown>
                  </div>
                );
              }
              if (part.type === "reasoning") {
                return (
                  <div key={partIdx} className="my-2 p-3 bg-muted/30 rounded-xl border-l-2 border-primary/30 text-muted-foreground text-sm italic">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="h-3 w-3" />
                      <span className="text-[10px] font-bold uppercase tracking-tighter">Thinking</span>
                    </div>
                    {part.text}
                  </div>
                );
              }
              if (part.type === "file") {
                return (
                  <div key={partIdx} className="relative group/img overflow-hidden rounded-2xl border border-border/50 shadow-lg mt-2 mb-4">
                    <img
                      src={part.url}
                      alt="Shared image"
                      className="max-h-[70dvh] w-auto object-contain transition-transform duration-500 group-hover/img:scale-[1.02]"
                    />
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>

        {!isUser && (
          <div className="flex items-center gap-1 mt-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-300 translate-x-1">
            <Button
              variant={null as any}
              size="icon"
              className="h-7 w-7 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
              onClick={() => onCopy(
                message.parts.filter((p:any) => p.type === 'text').map((p:any) => p.text).join(' '), 
                message.id
              )}
            >
              {copiedId === message.id ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </Button>
            {isLast && !isStreaming && !isLoading && (
               <Button
                variant={null as any}
                size="icon"
                className="h-7 w-7 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                onClick={onRegenerate}
              >
                <RotateCcw className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

ChatMessage.displayName = "ChatMessage";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [localInput, setLocalInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recipeContext, setRecipeContext] = useState<RecipeChatContext | null>(null);
  const recipeNameFromUrl = searchParams.get("recipeName");
  const recipeId = searchParams.get("recipeId");

  useEffect(() => {
    if (!recipeId) {
      setRecipeContext(null);
      return;
    }

    const storedContext = sessionStorage.getItem(`chat:recipe:${recipeId}`);
    if (!storedContext) return;

    try {
      setRecipeContext(JSON.parse(storedContext) as RecipeChatContext);
    } catch {
      sessionStorage.removeItem(`chat:recipe:${recipeId}`);
      setRecipeContext(null);
    }
  }, [recipeId]);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/ai/chat",
      }),
    [],
  );

  const { messages, sendMessage, status, error, stop, regenerate } = useChat({
    transport,
    messages: [] as UIMessage[],
  });

  const isStreaming = status === "streaming";
  const isLoading = status === "submitted";
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isAtBottom = useRef(true);
  const recipeContextRef = useRef<RecipeChatContext | null>(null);

  useEffect(() => {
    recipeContextRef.current = recipeContext;
  }, [recipeContext]);

  const handleSend = useCallback((text: string, files?: FileList) => {
    if (!text.trim() && (!files || files.length === 0)) return;
    isAtBottom.current = true;
    sendMessage(
      { text, files },
      {
        body: recipeContextRef.current
          ? { recipeContext: recipeContextRef.current }
          : undefined,
      },
    );
    setLocalInput("");
  }, [sendMessage]);

  const scrollToBottom = useCallback(() => {
    isAtBottom.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Universal scroll effect for both user and AI updates
  useEffect(() => {
    if (messages.length === 0) return;

    // Force stick to bottom when AI starts or user sends a message
    if (isStreaming || isLoading) {
      isAtBottom.current = true;
    }

    if (isAtBottom.current) {
      // Use requestAnimationFrame for smoother synchronization with the browser's render cycle
      const scroll = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ 
            behavior: isStreaming ? "instant" : "smooth" as ScrollBehavior,
            block: "end" 
          });
        }
      };
      
      const frameId = requestAnimationFrame(scroll);
      return () => cancelAnimationFrame(frameId);
    }
  }, [messages, isStreaming, isLoading]);

  // Track scroll position to update "isAtBottom" and toggle floating button
  useEffect(() => {
    if (messages.length === 0) return;
    
    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      // If we are within 100px of bottom, consider it "at bottom"
      const nearBottom = scrollHeight - scrollTop <= clientHeight + 100;
      isAtBottom.current = nearBottom;
      setShowScrollButton(!nearBottom);
    };

    scrollContainer.addEventListener("scroll", handleScroll);
    return () => scrollContainer.removeEventListener("scroll", handleScroll);
  }, [messages.length]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] flex-col bg-background/30 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent opacity-50" />
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-border/50 to-transparent" />

      {/* Main Content Area - Split into two views */}
      <div className="flex-1 overflow-hidden relative">
        {messages.length === 0 ? (
          /* Landing View - No Scroll, Centered */
          <div className="h-full flex flex-col items-center justify-center text-center px-4 pt-10 animate-in fade-in duration-700">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full scale-150 opacity-30" />
              <div className="relative h-16 w-16 rounded-[1.25rem] bg-card border border-border/40 flex items-center justify-center shadow-sm">
                <ChefHat className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h1 className="text-2xl md:text-5xl font-black tracking-tighter mb-2 text-foreground leading-tight">
              {recipeContext
                ? `Ask about ${recipeContext.name}`
                : "What's on the menu?"}
            </h1>
            <p className="text-muted-foreground/40 text-base md:text-lg max-w-lg mb-10 font-medium leading-relaxed">
              {recipeContext ? (
                <>
                  Recipe context is loaded for{" "}
                  <span className="text-foreground/70">{recipeNameFromUrl ?? recipeContext.name}</span>.
                  Ask for substitutions, scaling, timing, or technique help.
                </>
              ) : (
                <>
                  Your AI-powered culinary companion for recipes<br className="hidden md:block" /> and kitchen tips.
                </>
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl text-left">
              {(recipeContext
                ? [
                    { icon: Sparkles, text: `How can I make ${recipeContext.name} healthier?`, sub: "BALANCE" },
                    { icon: Soup, text: `What can I substitute in ${recipeContext.name}?`, sub: "SWAPS" },
                    { icon: UtensilsCrossed, text: `Walk me through the tricky steps in ${recipeContext.name}.`, sub: "GUIDE" },
                    { icon: Zap, text: `Scale ${recipeContext.name} for more servings.`, sub: "PORTIONS" },
                  ]
                : [
                    { icon: Sparkles, text: "Healthy keto breakfast ideas", sub: "QUICK" },
                    { icon: Soup, text: "Dinner with zero waste", sub: "SMART" },
                    { icon: UtensilsCrossed, text: "Homemade pizza dough", sub: "GUIDE" },
                    { icon: Zap, text: "Substitute for eggs", sub: "SCIENCE" },
                  ]).map((tip) => (
                <button
                  key={tip.text}
                  onClick={() => handleSend(tip.text)}
                  className="flex items-center gap-3.5 p-3.5 rounded-xl border border-border/40 bg-card/40 hover:bg-card/60 hover:border-primary/20 transition-all group focus:outline-hidden"
                >
                  <div className="h-9 w-9 shrink-0 rounded-lg bg-muted/20 flex items-center justify-center transition-all duration-300">
                    <tip.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-bold text-foreground/70 group-hover:text-primary transition-colors leading-[1.2]">{tip.text}</span>
                    <span className="text-[9px] text-muted-foreground/30 uppercase tracking-widest font-black mt-1">{tip.sub}</span>
                  </div>
                </button>
              ))}
            </div>
            {/* Added bottom padding to landing view to avoid the input island */}
            <div className="h-32" />
          </div>
        ) : (
          /* Chat View - Fully Scrollable with Native Feel */
          <div 
            ref={scrollRef} 
            className="h-full px-4 overflow-y-auto scroll-smooth no-scrollbar"
          >
            <div className="mx-auto max-w-4xl py-10 space-y-6 pb-40">
              {messages.map((message, i) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={i === messages.length - 1}
                  isStreaming={isStreaming}
                  isLoading={isLoading}
                  onCopy={handleCopy}
                  copiedId={copiedId}
                  onRegenerate={() =>
                    regenerate({
                      body: recipeContextRef.current
                        ? { recipeContext: recipeContextRef.current }
                        : undefined,
                    })
                  }
                />
              ))}

              {isLoading && (
                <div className="flex items-start gap-3 md:gap-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <Avatar className="h-10 w-10 bg-card glass border border-border/50 shadow-md">
                    <AvatarFallback>
                      <ChefHat className="h-5 w-5 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-card/40 border border-border/40 backdrop-blur-md rounded-3xl rounded-tl-none px-6 py-4 shadow-sm flex items-center gap-3">
                    <div className="flex gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
                      <div className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-primary/60">
                      ChefLens is thinking...
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-3xl bg-destructive/5 border-destructive/20 text-destructive mx-auto max-w-2xl py-4"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <AlertDescription className="text-sm font-bold flex-1">
                      {error.message || "Something went wrong with the connection."}
                    </AlertDescription>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() =>
                        regenerate({
                          body: recipeContextRef.current
                            ? { recipeContext: recipeContextRef.current }
                            : undefined,
                        })
                      }
                      className="bg-background/50 border-destructive/20 hover:bg-destructive/10 text-destructive rounded-xl h-8 px-3 focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      Retry
                    </Button>
                  </div>
                </Alert>
              )}

              <div ref={messagesEndRef} className="h-2 invisible" />
            </div>
          </div>
        )}
      </div>

      {/* Floating Scroll Button */}
      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute bottom-32 right-8 h-10 w-10 rounded-full shadow-2xl bg-card/80 backdrop-blur-md border border-border/50 hover:bg-card transition-all z-10 animate-in fade-in zoom-in duration-300 focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={scrollToBottom}
        >
          <ArrowDown className="h-5 w-5 text-primary" />
        </Button>
      )}

      {/* Input Overlay */}
      <div className="relative z-10">
        <ChatInput
          input={localInput}
          onInputChange={setLocalInput}
          onSubmit={(e, files) => handleSend(localInput, files)}
          isStreaming={isStreaming || isLoading}
          onStop={async () => stop()}
          className="pb-2"
        />
      </div>
    </div>
  );
}

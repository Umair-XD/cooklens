"use client";

import { useRef, useEffect, useState, useMemo, memo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { Streamdown } from "streamdown";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ChatInput from "@/components/ChatInput";
import {
  ChefHat,
  AlertCircle,
  Sparkles,
  User,
  Copy,
  Check,
  RotateCcw,
  ArrowDown,
  Zap,
  UtensilsCrossed,
  Soup,
} from "lucide-react";
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
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  steps: Array<{ stepNumber: number; instruction: string }>;
  nutrition: {
    caloriesPerServing: number;
    proteinGrams: number;
    carbsGrams: number;
    fatGrams: number;
  };
}

function AssistantAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("shrink-0 shadow-lg", className)}>
      <AvatarFallback className="bg-gradient-to-br from-primary/90 to-primary/60 text-primary-foreground">
        <ChefHat className="h-5 w-5" />
      </AvatarFallback>
    </Avatar>
  );
}

function UserAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("shrink-0 shadow-lg", className)}>
      <AvatarFallback className="bg-gradient-to-br from-slate-600 to-slate-800 dark:from-slate-500 dark:to-slate-700 text-white">
        <User className="h-4.5 w-4.5" />
      </AvatarFallback>
    </Avatar>
  );
}

const ChatMessage = memo(
  ({
    message,
    isLast,
    isStreaming,
    isLoading,
    onCopy,
    copiedId,
    onRegenerate,
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
          "flex items-start gap-3 md:gap-4 group/msg animate-in fade-in slide-in-from-bottom-4 duration-500",
          isUser ? "flex-row-reverse" : "flex-row",
        )}
      >
        {isUser ? (
          <UserAvatar className="h-9 w-9 mt-0.5" />
        ) : (
          <AssistantAvatar className="h-9 w-9 mt-0.5" />
        )}

        <div
          className={cn(
            "relative flex flex-col gap-1.5 max-w-[82%] md:max-w-[72%]",
            isUser ? "items-end" : "items-start",
          )}
        >
          <div
            className={cn(
              "relative px-4 py-3 text-sm leading-relaxed break-words",
              isUser
                ? "bg-primary text-primary-foreground font-medium rounded-2xl rounded-br-sm shadow-md shadow-primary/25 selection:bg-white/90 selection:text-slate-900"
                : "bg-card border border-border/50 rounded-2xl rounded-bl-sm shadow-sm",
            )}
          >
            {isUser ? (
              <div className="whitespace-pre-wrap">
                {(message.parts as any[]).map((part: any, i: number) =>
                  part.type === "text" ? (
                    <span key={i}>{part.text}</span>
                  ) : part.type === "file" ? (
                    <div
                      key={i}
                      className="mt-2 overflow-hidden rounded-xl border border-white/20"
                    >
                      <img
                        src={part.url}
                        alt="Shared image"
                        className="max-h-64 w-auto object-contain"
                      />
                    </div>
                  ) : null,
                )}
              </div>
            ) : (
              <div
                className={cn(
                  "prose prose-sm dark:prose-invert max-w-none",
                  "prose-p:my-1.5 prose-p:leading-relaxed",
                  "prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-5 prose-headings:mb-2",
                  "prose-h2:text-base prose-h3:text-sm",
                  "prose-ul:my-2 prose-ul:pl-4 prose-li:my-0.5",
                  "prose-ol:my-2 prose-ol:pl-4",
                  "prose-strong:font-semibold prose-strong:text-foreground",
                  "prose-code:text-primary prose-code:bg-primary/8 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none",
                  "prose-pre:bg-muted/60 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:my-3",
                  "prose-blockquote:border-l-primary/40 prose-blockquote:text-muted-foreground prose-blockquote:not-italic",
                  "prose-hr:border-border/30 prose-hr:my-4",
                )}
              >
                {(message.parts as any[]).map((part: any, partIdx: number) => {
                  if (part.type === "text") {
                    return (
                      <div key={partIdx}>
                        <Streamdown
                          mode={shouldStream ? "streaming" : "static"}
                        >
                          {part.text}
                        </Streamdown>
                      </div>
                    );
                  }
                  if (part.type === "reasoning") {
                    return (
                      <div
                        key={partIdx}
                        className="my-2 p-3 bg-muted/30 rounded-xl border-l-2 border-primary/30 text-muted-foreground text-xs italic not-prose"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3 w-3 text-primary/60" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
                            Thinking
                          </span>
                        </div>
                        {part.text}
                      </div>
                    );
                  }
                  if (part.type === "file") {
                    return (
                      <div
                        key={partIdx}
                        className="not-prose overflow-hidden rounded-xl border border-border/50 shadow-sm mt-2 mb-3"
                      >
                        <img
                          src={part.url}
                          alt="Shared image"
                          className="max-h-[60dvh] w-auto object-contain"
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>

          {!isUser && (
            <div className="flex items-center gap-0.5 px-1 opacity-0 group-hover/msg:opacity-100 transition-opacity duration-200">
              <button
                onClick={() =>
                  onCopy(
                    message.parts
                      .filter((p: any) => p.type === "text")
                      .map((p: any) => p.text)
                      .join(" "),
                    message.id,
                  )
                }
                className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                title="Copy"
              >
                {copiedId === message.id ? (
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                ) : (
                  <Copy className="h-3.5 w-3.5 text-muted-foreground/60" />
                )}
              </button>
              {isLast && !isStreaming && !isLoading && (
                <button
                  onClick={onRegenerate}
                  className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-muted transition-colors"
                  title="Regenerate"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-muted-foreground/60" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  },
);

ChatMessage.displayName = "ChatMessage";

function ThinkingIndicator() {
  return (
    <div className="flex items-end gap-3 md:gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <AssistantAvatar className="h-9 w-9 mt-0.5" />
      <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 rounded-full bg-primary/60 animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

function ChatPage() {
  const searchParams = useSearchParams();
  const [localInput, setLocalInput] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [recipeContext, setRecipeContext] = useState<RecipeChatContext | null>(
    null,
  );
  const recipeNameFromUrl = searchParams.get("recipeName");
  const recipeId = searchParams.get("recipeId");

  useEffect(() => {
    if (!recipeId) {
      setRecipeContext(null);
      return;
    }
    const stored = sessionStorage.getItem(`chat:recipe:${recipeId}`);
    if (!stored) return;
    try {
      setRecipeContext(JSON.parse(stored) as RecipeChatContext);
    } catch {
      sessionStorage.removeItem(`chat:recipe:${recipeId}`);
      setRecipeContext(null);
    }
  }, [recipeId]);

  const transport = useMemo(
    () => new DefaultChatTransport({ api: "/api/ai/chat" }),
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

  const handleSend = useCallback(
    (text: string, files?: FileList) => {
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
    },
    [sendMessage],
  );

  const scrollToBottom = useCallback(() => {
    isAtBottom.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    if (isStreaming || isLoading) isAtBottom.current = true;
    if (isAtBottom.current) {
      const id = requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: isStreaming ? "instant" : "smooth",
          block: "end",
        });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [messages, isStreaming, isLoading]);

  useEffect(() => {
    if (messages.length === 0) return;
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const near = el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
      isAtBottom.current = near;
      setShowScrollButton(!near);
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [messages.length]);

  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const promptCards = recipeContext
    ? [
        {
          icon: Sparkles,
          text: `How can I make ${recipeContext.name} healthier?`,
          sub: "NUTRITION",
        },
        {
          icon: Soup,
          text: `What can I substitute in ${recipeContext.name}?`,
          sub: "SWAPS",
        },
        {
          icon: UtensilsCrossed,
          text: `Walk me through every step of ${recipeContext.name} in detail.`,
          sub: "GUIDE",
        },
        {
          icon: Zap,
          text: `Scale ${recipeContext.name} for more servings.`,
          sub: "PORTIONS",
        },
      ]
    : [
        { icon: Sparkles, text: "Give me a healthy keto breakfast recipe", sub: "NUTRITION" },
        { icon: Soup, text: "What can I make with chicken and garlic?", sub: "PANTRY" },
        { icon: UtensilsCrossed, text: "Teach me how to make homemade pizza dough", sub: "GUIDE" },
        { icon: Zap, text: "What's a good egg substitute for baking?", sub: "SWAPS" },
      ];

  return (
    <div className="relative flex h-[calc(100dvh-4rem)] flex-col bg-background/30 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.08),transparent)]" />

      <div className="flex-1 overflow-hidden relative">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-[2] opacity-40" />
              <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/90 to-primary/60 flex items-center justify-center shadow-xl shadow-primary/20">
                <ChefHat className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>

            <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-2 text-foreground">
              {recipeContext
                ? `Ask about ${recipeContext.name}`
                : "What's on the menu?"}
            </h1>
            <p className="text-muted-foreground/60 text-sm md:text-base max-w-md mb-8 font-medium">
              {recipeContext ? (
                <>
                  Recipe loaded:{" "}
                  <span className="text-foreground/80 font-semibold">
                    {recipeNameFromUrl ?? recipeContext.name}
                  </span>
                  . Ask for substitutions, scaling, or step-by-step help.
                </>
              ) : (
                "Your AI culinary companion — recipes, techniques, and kitchen tips."
              )}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-lg text-left mb-8">
              {promptCards.map((card) => (
                <button
                  key={card.text}
                  onClick={() => handleSend(card.text)}
                  className="group flex items-start gap-3 p-3.5 rounded-xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-sm transition-all text-left focus:outline-none"
                >
                  <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-primary/8 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                    <card.icon className="h-4 w-4 text-primary/70 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground/80 group-hover:text-foreground leading-snug transition-colors">
                      {card.text}
                    </p>
                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40 mt-0.5 block">
                      {card.sub}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="h-4" />
          </div>
        ) : (
          <div
            ref={scrollRef}
            className="h-full overflow-y-auto scroll-smooth no-scrollbar"
          >
            <div className="mx-auto max-w-3xl px-4 py-6 space-y-5 pb-6">
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

              {isLoading && <ThinkingIndicator />}

              {error && (
                <Alert
                  variant="destructive"
                  className="rounded-2xl bg-destructive/5 border-destructive/20 text-destructive"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <AlertDescription className="text-sm font-medium flex-1">
                      {error.message || "Something went wrong. Please try again."}
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
                      className="bg-background/50 border-destructive/20 hover:bg-destructive/10 text-destructive rounded-lg h-7 px-3 text-xs"
                    >
                      Retry
                    </Button>
                  </div>
                </Alert>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>
        )}
      </div>

      {showScrollButton && (
        <Button
          variant="secondary"
          size="icon"
          onClick={scrollToBottom}
          className="absolute bottom-28 right-6 h-9 w-9 rounded-full shadow-lg bg-card/90 backdrop-blur-md border border-border/50 hover:bg-card transition-all z-10 animate-in fade-in zoom-in duration-200"
        >
          <ArrowDown className="h-4 w-4 text-primary" />
        </Button>
      )}

      <div className="relative z-10 border-t border-border/30 bg-background/60 backdrop-blur-xl">
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

export default function ChatPageWrapper() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}

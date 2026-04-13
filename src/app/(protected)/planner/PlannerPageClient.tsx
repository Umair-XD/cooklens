"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlannerForm, { type PlannerFormValues } from "@/components/PlannerForm";
import WeeklyPlanView, {
  WeeklyPlanSkeleton,
} from "@/components/WeeklyPlanView";
import { generatePlan, getPlan } from "@/lib/actions/planner.actions";
import { calculateTDEE } from "@/lib/utils/tdee";
import { Target, Sparkles, ChefHat, LayoutGrid } from "lucide-react";
import type { IMealPlan } from "@/lib/db/models/MealPlan";
import { cn } from "@/lib/utils";

interface PlannerPageClientProps {
  userId: string;
  initialPlan: IMealPlan | null;
}

export default function PlannerPageClient({
  userId,
  initialPlan,
}: PlannerPageClientProps) {
  const router = useRouter();
  const [plan, setPlan] = useState<IMealPlan | null>(initialPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [tdeeResult, setTdeeResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: PlannerFormValues) => {
      setError(null);
      setIsLoading(true);

      const tdee = calculateTDEE(
        values.age,
        values.weightKg,
        values.heightCm,
        values.sex,
        values.activityLevel,
      );
      setTdeeResult(tdee);

      const result = await generatePlan({ ...values, userId });

      if (result.success && result.plan) {
        setPlan(result.plan);
      } else {
        setError(result.error ?? "Failed to generate plan");
      }
      setIsLoading(false);
    },
    [userId],
  );

  const handleRefreshPlan = useCallback(async () => {
    setIsLoading(true);
    const result = await getPlan(userId);
    if (result.success && result.plan) {
      setPlan(result.plan);
    }
    setIsLoading(false);
    router.refresh();
  }, [userId, router]);

  return (
    <div className="min-h-screen bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
              <ChefHat className="h-4 w-4" />
              Weekly Meal Plan
            </div>
            <h1 className="text-4xl font-black font-outfit tracking-tighter lg:text-5xl">
              Plan your <span className="text-primary italic">Kitchen</span>
            </h1>
            <p className="max-w-xl text-lg text-muted-foreground font-medium">
              Precision nutrition meets AI-crafted culinary planning.
            </p>
          </div>
          
          {plan && (
             <div className="flex items-center gap-3 p-1 rounded-2xl bg-muted/20 border border-border/50 glass">
               <div className="px-4 py-2 rounded-xl bg-background/60 text-sm font-bold shadow-sm">
                 Current Plan Active
               </div>
             </div>
          )}
        </div>

        {error && (
          <div className="mb-8 rounded-2xl border border-destructive/20 bg-destructive/5 px-6 py-4 flex items-center gap-3 text-sm font-semibold text-destructive animate-in bounce-in">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            {error}
          </div>
        )}

        {/* Main layout: form sidebar + plan area */}
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
          {/* Form — Sticky Sidebar */}
          <div className="w-full lg:w-[350px] lg:shrink-0 lg:sticky lg:top-24 space-y-6 animate-in fade-in slide-in-from-left-4 duration-700">
            <PlannerForm
              onSubmit={handleSubmit}
              isLoading={isLoading}
              tdeeResult={tdeeResult}
            />
            
            {!plan && (
               <div className="p-6 rounded-3xl border border-dashed border-border/60 bg-muted/5 flex flex-col items-center text-center gap-3">
                 <LayoutGrid className="h-8 w-8 text-muted-foreground/20" />
                 <p className="text-xs font-bold uppercase tracking-tighter text-muted-foreground/40">
                   Plan Preview Region
                 </p>
               </div>
            )}
          </div>

          {/* Plan area — takes remaining space */}
          <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-right-4 duration-700">
            {isLoading && !plan && <WeeklyPlanSkeleton />}

            {!isLoading && !plan && (
              <div className="relative group overflow-hidden rounded-3xl border border-dashed border-border/60 bg-muted/5 py-32 text-center transition-all hover:bg-muted/10">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative flex flex-col items-center">
                  <div className="mb-6 p-4 rounded-full bg-background border shadow-premium animate-float">
                    <Sparkles className="h-10 w-10 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Let's plan your week</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                    Tell us a bit about your goals in the sidebar, and we'll generate a personalized meal plan just for you.
                  </p>
                </div>
              </div>
            )}

            {plan && (
              <div className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-30 pointer-events-none" : "opacity-100"
              )}>
                <WeeklyPlanView plan={plan} onRegenerate={handleRefreshPlan} />
              </div>
            )}

            {plan && isLoading && (
              <div className="mt-8">
                <WeeklyPlanSkeleton />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

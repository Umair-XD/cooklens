"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PlannerForm, { type PlannerFormValues } from "@/components/PlannerForm";
import WeeklyPlanView, {
  WeeklyPlanSkeleton,
} from "@/components/WeeklyPlanView";
import { generatePlan } from "@/lib/actions/planner.actions";
import { calculateTDEE } from "@/lib/utils/tdee";
import { Target, Sparkles } from "lucide-react";
import type { IMealPlan } from "@/lib/db/models/MealPlan";

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

  const handleRegenerate = useCallback(async () => {
    if (!plan) return;
    setIsLoading(true);
    const { getPlan } = await import("@/lib/actions/planner.actions");
    const result = await getPlan(userId);
    if (result.success && result.plan) setPlan(result.plan);
    setIsLoading(false);
    router.refresh();
  }, [plan, userId, router]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Meal Planner</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your stats to generate a personalized 7-day meal plan
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-[13px] text-destructive">
          {error}
        </div>
      )}

      {/* TDEE banner */}
      {tdeeResult !== null && (
        <div className="mb-8 flex items-center gap-3 rounded-xl border bg-primary/5 px-5 py-4">
          <Target className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">
              Your estimated TDEE:{" "}
              <span className="text-primary">{tdeeResult} kcal/day</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Meals will be distributed across breakfast (25%), lunch (35%), and
              dinner (40%)
            </p>
          </div>
        </div>
      )}

      {/* Main layout: form sidebar + plan area */}
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Form — fixed width on desktop */}
        <div className="w-full lg:w-80 lg:shrink-0 lg:sticky lg:top-24">
          <PlannerForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            tdeeResult={tdeeResult}
          />
        </div>

        {/* Plan area — takes remaining space */}
        <div className="min-w-0 flex-1">
          {isLoading && !plan && <WeeklyPlanSkeleton />}

          {!isLoading && !plan && (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-24 text-center">
              <Sparkles className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No plan generated yet
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Fill in your stats and hit Generate to build your week
              </p>
            </div>
          )}

          {plan && !isLoading && (
            <WeeklyPlanView plan={plan} onRegenerate={handleRegenerate} />
          )}

          {plan && isLoading && <WeeklyPlanSkeleton />}
        </div>
      </div>
    </div>
  );
}

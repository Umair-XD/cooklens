"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import PlannerForm, { type PlannerFormValues } from "@/components/PlannerForm";
import WeeklyPlanView, {
  WeeklyPlanSkeleton,
} from "@/components/WeeklyPlanView";
import { generatePlan } from "@/lib/actions/planner.actions";
import { calculateTDEE } from "@/lib/utils/tdee";
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
  const { data: session } = useSession();

  const [plan, setPlan] = useState<IMealPlan | null>(initialPlan);
  const [isLoading, setIsLoading] = useState(false);
  const [tdeeResult, setTdeeResult] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(
    async (values: PlannerFormValues) => {
      setError(null);
      setIsLoading(true);

      // Calculate and display TDEE
      const tdee = calculateTDEE(
        values.age,
        values.weightKg,
        values.heightCm,
        values.sex,
        values.activityLevel,
      );
      setTdeeResult(tdee);

      const result = await generatePlan({
        ...values,
        userId,
      });

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

    // Re-fetch plan from server
    const { getPlan } = await import("@/lib/actions/planner.actions");
    const result = await getPlan(userId);
    if (result.success && result.plan) {
      setPlan(result.plan);
    }
    setIsLoading(false);
    router.refresh();
  }, [plan, userId, router]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">Meal Planner</h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-[13px] text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        <div>
          <PlannerForm
            onSubmit={handleSubmit}
            isLoading={isLoading}
            tdeeResult={tdeeResult}
          />
        </div>
        <div>
          {isLoading && !plan && <WeeklyPlanSkeleton />}
          {!isLoading && !plan && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                Fill in your stats and generate a plan to get started
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

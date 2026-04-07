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
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Meal Planner</h1>

      {error && (
        <div className="mb-6 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
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

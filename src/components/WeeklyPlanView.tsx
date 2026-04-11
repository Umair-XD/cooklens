"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MealSlotCard, { MealSlotCardSkeleton } from "@/components/MealSlotCard";
import { IMealPlan, IMealSlot, MealType } from "@/lib/db/models/MealPlan";
import { IRecipe } from "@/lib/db/models/Recipe";
import { swapMeal, getAlternatives } from "@/lib/actions/planner.actions";
import { Download, RefreshCw } from "lucide-react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const COL_W = "w-[160px]";

interface WeeklyPlanViewProps {
  plan: IMealPlan;
  onRegenerate: () => void;
}

export function WeeklyPlanSkeleton() {
  return (
    <div className="overflow-x-auto rounded-xl border bg-muted/30 p-4">
      <div className="flex gap-3 min-w-[1150px]">
        {DAYS.map((day) => (
          <div key={day} className={`${COL_W} flex-shrink-0 space-y-3`}>
            <div className="h-5 bg-muted rounded" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
            <Skeleton className="h-24 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeeklyPlanView({
  plan,
  onRegenerate,
}: WeeklyPlanViewProps) {
  const [alternativesMap, setAlternativesMap] = useState<
    Record<string, IRecipe[]>
  >({});
  const [loadingAltId, setLoadingAltId] = useState<string | null>(null);
  const [swapping, setSwapping] = useState(false);

  const handleLoadAlternatives = useCallback(
    async (slotId: string) => {
      if (alternativesMap[slotId]) return;
      setLoadingAltId(slotId);
      const result = await getAlternatives(
        slotId,
        plan._id.toString(),
        plan.userId.toString(),
      );
      if (result.success && result.alternatives) {
        setAlternativesMap((prev) => ({
          ...prev,
          [slotId]: result.alternatives!,
        }));
      }
      setLoadingAltId(null);
    },
    [alternativesMap, plan._id, plan.userId],
  );

  const handleSwap = useCallback(
    async (slotId: string, alternativeRecipeId: string) => {
      setSwapping(true);
      const result = await swapMeal({
        planId: plan._id.toString(),
        slotId,
        alternativeRecipeId,
        userId: plan.userId.toString(),
      });
      if (result.success) {
        setAlternativesMap({});
        onRegenerate();
      }
      setSwapping(false);
    },
    [plan._id, plan.userId, onRegenerate],
  );

  const handleExportPdf = () => {
    window.open(
      `/api/planner/export-pdf?planId=${plan._id.toString()}`,
      "_blank",
    );
  };

  const planSlots = plan.slots as unknown as (IMealSlot & {
    recipeId: IRecipe;
  })[];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Weekly Meal Plan</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            PDF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRegenerate}
            disabled={swapping}
          >
            <RefreshCw
              className={
                swapping ? "mr-2 h-4 w-4 animate-spin" : "mr-2 h-4 w-4"
              }
            />
            Regenerate
          </Button>
        </div>
      </div>

      {/* Scrollable weekly grid */}
      <div className="overflow-x-auto rounded-xl border bg-muted/30 p-4">
        <div className="flex gap-3 min-w-[1150px]">
          {DAYS.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className={`${COL_W} flex-shrink-0 flex flex-col gap-3`}
            >
              {/* Day header */}
              <div className="text-center text-[13px] font-semibold text-muted-foreground pb-2 border-b border-border/50">
                {DAYS[dayIndex]}
              </div>
              {/* Meal slots */}
              {MEALS.map((meal) => {
                const slot = planSlots.find(
                  (s) => s.dayIndex === dayIndex && s.mealType === meal,
                ) as (typeof planSlots)[number] | undefined;
                const recipe = (slot as any)?.recipeId ?? null;
                const slotId = (slot as any)?._id?.toString() ?? "";
                const alternatives = alternativesMap[slotId] ?? [];
                const isLoading = loadingAltId === slotId;

                return (
                  <MealSlotCard
                    key={`${dayIndex}-${meal}`}
                    slot={slot as any}
                    recipe={recipe}
                    onSwap={handleSwap}
                    alternatives={alternatives}
                    isLoadingAlternatives={isLoading}
                    onLoadAlternatives={handleLoadAlternatives}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

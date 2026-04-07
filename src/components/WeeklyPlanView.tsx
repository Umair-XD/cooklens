"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MealSlotCard, { MealSlotCardSkeleton } from "@/components/MealSlotCard";
import { IMealPlan, IMealSlot, MealType } from "@/lib/db/models/MealPlan";
import { IRecipe } from "@/lib/db/models/Recipe";
import { swapMeal, getAlternatives } from "@/lib/actions/planner.actions";
import { Download, RefreshCw } from "lucide-react";
import type { Types } from "mongoose";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];

function getSlotsForDay(
  slots: IMealSlot[],
  dayIndex: number,
  mealType: MealType,
): (IMealSlot & { _id?: import("mongoose").Types.ObjectId }) | undefined {
  return slots.find(
    (s) => s.dayIndex === dayIndex && s.mealType === mealType,
  ) as (IMealSlot & { _id?: import("mongoose").Types.ObjectId }) | undefined;
}

function getRecipeForSlot(
  slots: IMealSlot[],
  dayIndex: number,
  mealType: MealType,
  plan: IMealPlan,
): IRecipe | null {
  const slot = getSlotsForDay(slots, dayIndex, mealType);
  if (!slot) return null;
  const populatedSlot = (
    plan.slots as unknown as (IMealSlot & { recipeId: IRecipe })[]
  ).find((s) => s.dayIndex === dayIndex && s.mealType === mealType);
  return populatedSlot?.recipeId ?? null;
}

interface WeeklyPlanViewProps {
  plan: IMealPlan;
  onRegenerate: () => void;
}

export function WeeklyPlanSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-3">
        {Array.from({ length: 21 }).map((_, i) => (
          <MealSlotCardSkeleton key={i} />
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
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Weekly Meal Plan</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPdf}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
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

      {/* 7-column CSS grid */}
      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-semibold text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {DAYS.map((_, dayIndex) => (
          <div key={dayIndex} className="flex flex-col gap-3">
            {MEALS.map((meal) => {
              const slot = planSlots.find(
                (s) => s.dayIndex === dayIndex && s.mealType === meal,
              ) as
                | ((typeof planSlots)[number] & { _id?: Types.ObjectId })
                | undefined;
              const recipe = slot?.recipeId ?? null;
              const slotId = slot?._id?.toString() ?? "";
              const alternatives = alternativesMap[slotId] ?? [];
              const isLoading = loadingAltId === slotId;

              return (
                <MealSlotCard
                  key={`${dayIndex}-${meal}`}
                  slot={
                    slot as IMealSlot & {
                      _id?: import("mongoose").Types.ObjectId;
                    }
                  }
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
  );
}

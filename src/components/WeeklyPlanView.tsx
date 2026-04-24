"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import MealSlotCard, { MealSlotCardSkeleton } from "@/components/MealSlotCard";
import { IMealPlan, IMealSlot, MealType } from "@/lib/db/models/MealPlan";
import { IRecipe } from "@/lib/db/models/Recipe";
import { swapMeal, getAlternatives } from "@/lib/actions/planner.actions";
import { Download, RefreshCw, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MEALS: MealType[] = ["BREAKFAST", "LUNCH", "DINNER"];
const COL_W = "w-[260px]";

interface WeeklyPlanViewProps {
  plan: IMealPlan;
  onRegenerate: () => void;
}

export function WeeklyPlanSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>
      <div className="overflow-x-auto rounded-2xl border bg-muted/5 p-6 shadow-premium">
        <div className="flex gap-6 min-w-[1200px]">
          {DAYS.map((day) => (
            <div key={day} className={`${COL_W} flex-shrink-0 space-y-4`}>
              <Skeleton className="h-6 w-16 mx-auto rounded" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-32 w-full rounded-2xl" />
            </div>
          ))}
        </div>
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
      `/planner/${plan._id.toString()}/preview`,
      "_blank",
    );
  };

  const planSlots = plan.slots as unknown as (IMealSlot & {
    recipeId: IRecipe;
  })[];

  const weekStartDate = new Date(plan.weekStart);
  const weekLabel = weekStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card/40 p-4 rounded-2xl border border-border/50 glass">
        <div className="flex items-center gap-4">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Weekly Strategy</h2>
            <p className="text-xs text-muted-foreground font-medium">Starting {weekLabel}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleExportPdf}
            className="rounded-xl px-4 bg-background/50 hover:bg-background/80 transition-all font-semibold"
          >
            <Download className="mr-2 h-4 w-4" />
            Export Menu
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onRegenerate}
            disabled={swapping}
            className="rounded-xl px-4 shadow-lg shadow-primary/20 transition-all font-semibold"
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                swapping ? "mr-2 animate-spin" : "mr-2"
              )}
            />
            {swapping ? "Updating..." : "Full Refresh"}
          </Button>
        </div>
      </div>

      {/* Main Grid Container */}
      <div className="relative group">
        <div className="overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 custom-scrollbar">
          <div className="flex gap-6 min-w-[max-content]">
            {DAYS.map((dayName, dayIndex) => (
              <div
                key={dayIndex}
                className={cn(
                  COL_W,
                  "flex-shrink-0 flex flex-col gap-4",
                  // Highlight today
                  new Date().getDay() === (dayIndex + 1) % 7 && "relative"
                )}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <span className="text-sm font-bold tracking-widest uppercase text-muted-foreground/70">
                    {dayName}
                  </span>
                  <div className="h-1 w-8 rounded-full bg-border/40" />
                </div>

                {/* Vertical Meal Stack */}
                <div className="flex flex-col gap-4 bg-muted/5 rounded-3xl p-2 border border-border/50 transition-colors hover:bg-muted/10">
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

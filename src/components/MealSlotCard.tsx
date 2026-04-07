"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, UtensilsCrossed } from "lucide-react";
import { cn } from "@/lib/utils";
import { IRecipe } from "@/lib/db/models/Recipe";
import { IMealSlot } from "@/lib/db/models/MealPlan";
import type { Types } from "mongoose";

interface MealSlotCardProps {
  slot: IMealSlot & { _id?: Types.ObjectId };
  recipe: IRecipe | null;
  onSwap: (slotId: string, alternativeRecipeId: string) => void;
  alternatives: IRecipe[];
  isLoadingAlternatives: boolean;
  onLoadAlternatives: (slotId: string) => void;
}

function MacroPill({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        color,
      )}
    >
      {label}: {value}g
    </span>
  );
}

export function MealSlotCardSkeleton() {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-16" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-6 w-20" />
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-14" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function MealSlotCard({
  slot,
  recipe,
  onSwap,
  alternatives,
  isLoadingAlternatives,
  onLoadAlternatives,
}: MealSlotCardProps) {
  const mealTypeLabel = slot.mealType.charAt(0) + slot.mealType.slice(1).toLowerCase();
  const calories = recipe?.nutrition?.caloriesPerServing ?? 0;

  const getCalorieColor = (cal: number): string => {
    if (cal < 400) return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    if (cal < 700) return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
  };

  return (
    <Card className="h-full transition-shadow hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {mealTypeLabel}
        </CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Swap meal</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Swap {mealTypeLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingAlternatives ? (
              <div className="px-2 py-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="mt-2 h-4 w-3/4" />
              </div>
            ) : alternatives.length === 0 ? (
              <DropdownMenuItem
                onSelect={() => onLoadAlternatives(slot._id?.toString() ?? "")}
                className="text-muted-foreground"
              >
                <UtensilsCrossed className="mr-2 h-4 w-4" />
                Load alternatives
              </DropdownMenuItem>
            ) : (
              alternatives.map((alt) => (
                <DropdownMenuItem
                  key={alt._id.toString()}
                  onSelect={() =>
                    onSwap(
                      slot._id?.toString() ?? "",
                      alt._id.toString(),
                    )
                  }
                >
                  <span className="truncate">{alt.name}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {alt.nutrition?.caloriesPerServing ?? 0} kcal
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-2">
        {recipe ? (
          <>
            <p className="text-sm font-semibold leading-tight">{recipe.name}</p>
            <Badge
              variant="secondary"
              className={cn("text-xs font-medium", getCalorieColor(calories))}
            >
              {calories} kcal
            </Badge>
            <div className="flex flex-wrap gap-1">
              <MacroPill
                label="P"
                value={recipe.nutrition?.proteinGrams ?? 0}
                color="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-200"
              />
              <MacroPill
                label="C"
                value={recipe.nutrition?.carbsGrams ?? 0}
                color="bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200"
              />
              <MacroPill
                label="F"
                value={recipe.nutrition?.fatGrams ?? 0}
                color="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
              />
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">No recipe assigned</p>
        )}
      </CardContent>
    </Card>
  );
}

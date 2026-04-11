"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

function MacroBadge({
  label,
  value,
  bg,
  fg,
}: {
  label: string;
  value: number;
  bg: string;
  fg: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium ${bg} ${fg}`}
    >
      {label}:{value}
    </span>
  );
}

export function MealSlotCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <Skeleton className="h-3 w-12" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-16" />
        <div className="flex gap-1">
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
          <Skeleton className="h-4 w-10" />
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
  const mealLabel =
    slot.mealType.charAt(0) + slot.mealType.slice(1).toLowerCase();
  const cal = recipe?.nutrition?.caloriesPerServing ?? 0;

  const calColor =
    cal < 400
      ? "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
      : cal < 650
        ? "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
        : "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400";

  return (
    <Card className="transition-shadow hover:shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1.5 pt-3 px-3">
        <span className="text-[11px] font-medium text-muted-foreground">
          {mealLabel}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 -mr-1.5">
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Swap {mealLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingAlternatives ? (
              <div className="px-2 py-3">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="mt-1.5 h-3 w-3/4" />
              </div>
            ) : alternatives.length === 0 ? (
              <DropdownMenuItem
                onSelect={() => onLoadAlternatives(slot._id?.toString() ?? "")}
                className="text-muted-foreground cursor-pointer"
              >
                <UtensilsCrossed className="mr-2 h-3.5 w-3.5" />
                Load alternatives
              </DropdownMenuItem>
            ) : (
              alternatives.map((alt) => (
                <DropdownMenuItem
                  key={alt._id.toString()}
                  onSelect={() =>
                    onSwap(slot._id?.toString() ?? "", alt._id.toString())
                  }
                  className="cursor-pointer"
                >
                  <span className="truncate text-xs">{alt.name}</span>
                  <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
                    {alt.nutrition?.caloriesPerServing ?? 0}
                  </span>
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-1.5">
        {recipe ? (
          <>
            <p className="text-[13px] font-semibold leading-tight line-clamp-2">
              {recipe.name}
            </p>
            <span
              className={cn(
                "inline-flex rounded-md px-1.5 py-0.5 text-[11px] font-semibold",
                calColor,
              )}
            >
              {cal} kcal
            </span>
            <div className="flex gap-1">
              <MacroBadge
                label="P"
                value={recipe.nutrition?.proteinGrams ?? 0}
                bg="bg-purple-500/10"
                fg="text-purple-600 dark:text-purple-400"
              />
              <MacroBadge
                label="C"
                value={recipe.nutrition?.carbsGrams ?? 0}
                bg="bg-amber-500/10"
                fg="text-amber-600 dark:text-amber-400"
              />
              <MacroBadge
                label="F"
                value={recipe.nutrition?.fatGrams ?? 0}
                bg="bg-red-500/10"
                fg="text-red-600 dark:text-red-400"
              />
            </div>
          </>
        ) : (
          <p className="text-[12px] text-muted-foreground">No recipe</p>
        )}
      </CardContent>
    </Card>
  );
}

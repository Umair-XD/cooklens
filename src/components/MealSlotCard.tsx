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
import { MoreHorizontal, UtensilsCrossed, Zap, Flame, Target } from "lucide-react";
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
  colorClass,
}: {
  label: string;
  value: number;
  colorClass: string;
}) {
  return (
    <div className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter shadow-sm", colorClass)}>
      <span>{label}</span>
      <span className="opacity-70">/</span>
      <span>{value}g</span>
    </div>
  );
}

export function MealSlotCardSkeleton() {
  return (
    <Card className="border-none bg-background/40 shadow-sm glass">
      <CardHeader className="pb-2 pt-4 px-4">
        <Skeleton className="h-3 w-16" />
      </CardHeader>
      <CardContent className="space-y-3 pb-4 px-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-20" />
        <div className="flex gap-2">
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
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
      ? "text-emerald-500 bg-emerald-500/10 border-emerald-500/20"
      : cal < 650
        ? "text-blue-500 bg-blue-500/10 border-blue-500/20"
        : "text-amber-500 bg-amber-500/10 border-amber-500/20";

  return (
    <Card className="group relative border-none bg-card/60 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 glass overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
      
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
          <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground/80">
            {mealLabel}
          </span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 transition-colors">
              <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 rounded-xl backdrop-blur-xl bg-background/90 border-border/50">
            <DropdownMenuLabel className="flex items-center gap-2 px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Zap className="h-3 w-3" />
              Swap Options
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="my-1 bg-border/40" />
            {isLoadingAlternatives ? (
              <div className="px-2 py-4 flex flex-col gap-2">
                <Skeleton className="h-8 w-full rounded-lg" />
                <Skeleton className="h-8 w-full rounded-lg" />
              </div>
            ) : alternatives.length === 0 ? (
              <DropdownMenuItem
                onSelect={() => onLoadAlternatives(slot._id?.toString() ?? "")}
                className="rounded-lg p-2 focus:bg-primary/10 focus:text-primary transition-colors cursor-pointer group/item"
              >
                <UtensilsCrossed className="mr-2 h-4 w-4 text-muted-foreground group-hover/item:text-primary" />
                <span className="text-sm font-medium">Load alternative meals</span>
              </DropdownMenuItem>
            ) : (
              <div className="max-h-60 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                {alternatives.map((alt) => (
                  <DropdownMenuItem
                    key={alt._id.toString()}
                    onSelect={() =>
                      onSwap(slot._id?.toString() ?? "", alt._id.toString())
                    }
                    className="flex flex-col items-start rounded-lg p-2 focus:bg-primary/10 transition-all cursor-pointer border border-transparent hover:border-primary/20"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                       <span className="truncate text-sm font-bold">{alt.name}</span>
                       <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-primary/10 text-primary whitespace-nowrap">
                         {alt.nutrition?.caloriesPerServing ?? 0} kcal
                       </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3 relative">
        {recipe ? (
          <>
            <h3 className="text-sm font-bold leading-tight line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
              {recipe.name}
            </h3>
            
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold border shadow-sm",
                calColor
              )}>
                <Flame className="h-3.5 w-3.5" />
                {cal} kcal
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1 border-t border-border/30 mt-2">
              <MacroBadge
                label="P"
                value={recipe.nutrition?.proteinGrams ?? 0}
                colorClass="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/10"
              />
              <MacroBadge
                label="C"
                value={recipe.nutrition?.carbsGrams ?? 0}
                colorClass="bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/10"
              />
              <MacroBadge
                label="F"
                value={recipe.nutrition?.fatGrams ?? 0}
                colorClass="bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/10"
              />
            </div>
          </>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center border border-dashed rounded-2xl bg-muted/5">
             <Target className="h-5 w-5 text-muted-foreground/30 mb-1" />
             <p className="text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">No Selection</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

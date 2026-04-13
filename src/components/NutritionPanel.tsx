"use client";

import { useState } from "react";
import { Minus, Plus, Activity, Zap, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/ui/glass-card";

export interface NutritionInfo {
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

interface NutritionPanelProps {
  nutrition: NutritionInfo;
  baseServings: number;
}

function NumberInput({
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-muted/30 border border-border/50">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg hover:bg-background shadow-sm transition-all"
        onClick={decrement}
        disabled={value <= min}
      >
        <Minus className="h-3.5 w-3.5" />
      </Button>
      <div className="w-10 text-center text-sm font-black font-outfit">
        {value}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg hover:bg-background shadow-sm transition-all"
        onClick={increment}
        disabled={value >= max}
      >
        <Plus className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}

export function NutritionPanel({
  nutrition,
  baseServings,
}: NutritionPanelProps) {
  const [servings, setServings] = useState(baseServings);

  const scaleFactor = servings / baseServings;

  const adjustedCalories = Math.round(
    nutrition.caloriesPerServing * scaleFactor,
  );
  const adjustedProtein =
    Math.round(nutrition.proteinGrams * scaleFactor * 10) / 10;
  const adjustedCarbs =
    Math.round(nutrition.carbsGrams * scaleFactor * 10) / 10;
  const adjustedFat = Math.round(nutrition.fatGrams * scaleFactor * 10) / 10;

  const totalGrams = adjustedProtein + adjustedCarbs + adjustedFat;
  const proteinRatio = (adjustedProtein / totalGrams) * 100 || 0;
  const carbsRatio = (adjustedCarbs / totalGrams) * 100 || 0;
  const fatRatio = (adjustedFat / totalGrams) * 100 || 0;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
           <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">Macro Analysis</h3>
           <p className="text-xs font-bold text-primary">Dynamic Serving Calibration</p>
        </div>
        <NumberInput value={servings} onChange={setServings} min={1} max={99} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-6 md:col-span-1 flex flex-col items-center justify-center text-center gap-2" variant="tinted">
           <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Flame className="h-5 w-5 fill-current" />
           </div>
           <div className="text-3xl font-black font-outfit tracking-tighter">{adjustedCalories}</div>
           <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Calories</div>
        </GlassCard>

        <div className="md:col-span-3 space-y-6 flex flex-col justify-center bg-muted/20 p-6 rounded-3xl border border-border/50">
          <MacroBar
            label="Protein"
            value={adjustedProtein}
            percent={proteinRatio}
            color="bg-emerald-500"
            icon={<Zap className="h-3 w-3" />}
          />
          <MacroBar
            label="Carbohydrates"
            value={adjustedCarbs}
            percent={carbsRatio}
            color="bg-amber-500"
            icon={<Activity className="h-3 w-3" />}
          />
          <MacroBar
            label="Lipids / Fats"
            value={adjustedFat}
            percent={fatRatio}
            color="bg-rose-500"
            icon={<Activity className="h-3 w-3" />}
          />
        </div>
      </div>
      
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/20">
         <p className="text-[10px] font-bold text-center text-primary uppercase tracking-[0.2em]">
            Values adjusted for {servings} serving{servings !== 1 ? "s" : ""}
         </p>
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  percent,
  color,
  icon,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
           <div className={cn("p-1 rounded-md", color.replace('bg-', 'text-').replace('500', '500/10'), color.replace('bg-', 'bg-'))}>
              <div className="text-white">
                {icon}
              </div>
           </div>
           <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">{label}</span>
        </div>
        <span className="text-sm font-black font-outfit tracking-tight">{value}g <span className="text-[10px] text-muted-foreground/40 font-bold ml-1">({Math.round(percent)}%)</span></span>
      </div>
      <Progress value={percent} className={cn("h-1.5", color)} />
    </div>
  );
}

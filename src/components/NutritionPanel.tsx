'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseInt(e.target.value, 10);
    if (!isNaN(parsed)) {
      onChange(Math.min(max, Math.max(min, parsed)));
    }
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={decrement}
        disabled={value <= min}
        aria-label="Decrease servings"
      >
        <Minus className="h-3 w-3" />
      </Button>
      <Input
        type="number"
        value={value}
        onChange={handleChange}
        className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        min={min}
        max={max}
        aria-label="Number of servings"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={increment}
        disabled={value >= max}
        aria-label="Increase servings"
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}

export function NutritionPanel({ nutrition, baseServings }: NutritionPanelProps) {
  const [servings, setServings] = useState(baseServings);

  const scaleFactor = servings / baseServings;

  const adjustedCalories = Math.round(nutrition.caloriesPerServing * scaleFactor);
  const adjustedProtein = Math.round(nutrition.proteinGrams * scaleFactor * 10) / 10;
  const adjustedCarbs = Math.round(nutrition.carbsGrams * scaleFactor * 10) / 10;
  const adjustedFat = Math.round(nutrition.fatGrams * scaleFactor * 10) / 10;

  // Macro percentages for progress bars (out of 100g reference)
  const maxMacro = 100;
  const proteinPercent = Math.min((adjustedProtein / maxMacro) * 100, 100);
  const carbsPercent = Math.min((adjustedCarbs / maxMacro) * 100, 100);
  const fatPercent = Math.min((adjustedFat / maxMacro) * 100, 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Nutrition</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Servings:</span>
          <NumberInput value={servings} onChange={setServings} min={1} max={99} />
        </div>
      </div>

      <div className="text-center py-4 bg-muted/50 rounded-lg">
        <p className="text-3xl font-bold">{adjustedCalories}</p>
        <p className="text-sm text-muted-foreground">calories (per {servings} serving{servings !== 1 ? 's' : ''})</p>
      </div>

      <div className="space-y-4">
        <MacroBar label="Protein" value={adjustedProtein} percent={proteinPercent} color="bg-blue-500" />
        <MacroBar label="Carbs" value={adjustedCarbs} percent={carbsPercent} color="bg-amber-500" />
        <MacroBar label="Fat" value={adjustedFat} percent={fatPercent} color="bg-rose-500" />
      </div>
    </div>
  );
}

function MacroBar({
  label,
  value,
  percent,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}g</span>
      </div>
      <Progress
        value={percent}
        className={cn('h-2', color)}
      />
    </div>
  );
}

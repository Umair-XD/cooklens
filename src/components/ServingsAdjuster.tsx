"use client";

import { Minus, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServingsAdjusterProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export function ServingsAdjuster({
  value,
  onChange,
  min = 1,
  max = 99,
}: ServingsAdjusterProps) {
  const increment = () => {
    if (value < max) onChange(value + 1);
  };

  const decrement = () => {
    if (value > min) onChange(value - 1);
  };

  return (
    <div className="flex items-center gap-3 p-1.5 px-3 rounded-2xl bg-primary/5 border border-primary/10 transition-all hover:border-primary/20">
      <div className="flex items-center gap-2 mr-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="text-xs font-black uppercase tracking-widest text-primary/70">
          Servings
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-background transition-all text-primary"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <div className="w-8 text-center text-base font-black font-outfit text-primary">
          {value}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl hover:bg-background transition-all text-primary"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

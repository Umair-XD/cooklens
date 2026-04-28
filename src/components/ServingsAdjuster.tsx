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
    <div className="flex w-full min-w-0 items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-3 py-2 transition-all hover:border-primary/20 sm:w-auto sm:justify-start sm:px-3 sm:py-1.5">
      <div className="flex min-w-0 items-center gap-2 sm:mr-2">
        <Users className="h-4 w-4 text-primary" />
        <span className="truncate text-[11px] font-black uppercase tracking-[0.2em] text-primary/70 sm:text-xs sm:tracking-widest">
          Servings
        </span>
      </div>
      <div className="ml-auto flex shrink-0 items-center justify-end gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-primary transition-all hover:bg-background sm:h-8 sm:w-8"
          onClick={decrement}
          disabled={value <= min}
        >
          <Minus className="h-3.5 w-3.5" />
        </Button>
        <div className="w-9 text-center text-base font-black font-outfit text-primary sm:w-8">
          {value}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl text-primary transition-all hover:bg-background sm:h-8 sm:w-8"
          onClick={increment}
          disabled={value >= max}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}

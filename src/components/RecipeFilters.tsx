'use client';

import { useState } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export interface FilterState {
  cuisineType?: string;
  difficulty?: string;
  maxPrepTime?: number;
}

export interface RecipeFiltersProps {
  onFilterChange?: (filters: FilterState) => void;
  cuisines?: string[];
  className?: string;
}

const DEFAULT_CUISINES = [
  'Italian',
  'Chinese',
  'Japanese',
  'Indian',
  'Mexican',
  'Thai',
  'French',
  'American',
  'Mediterranean',
  'Korean',
];

const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'] as const;

import { Utensils, Zap, Clock, Filter } from 'lucide-react';

export function RecipeFilters({
  onFilterChange,
  cuisines = DEFAULT_CUISINES,
  className,
}: RecipeFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    maxPrepTime: 120,
  });

  const updateFilters = (updates: Partial<FilterState>) => {
    const next = { ...filters, ...updates };
    setFilters(next);
    onFilterChange?.(next);
  };

  return (
    <div className={cn('flex flex-col gap-6 p-6 md:p-8 rounded-[2rem] glass-dark border-border/10 shadow-premium relative overflow-hidden', className)}>
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
         <Filter size={120} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {/* Cuisine Type Select */}
        <div className="space-y-3">
          <Label htmlFor="cuisine-select" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
             <Utensils className="h-3 w-3 text-primary" />
             Cuisine
          </Label>
          <Select
            value={filters.cuisineType || ''}
            onValueChange={(value) =>
              updateFilters({ cuisineType: value || undefined })
            }
          >
            <SelectTrigger id="cuisine-select" className="h-12 rounded-2xl bg-background/40 border-border/20 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder="Any cuisine" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl glass p-1">
              <SelectItem value="__any__" className="rounded-xl font-bold">Any cuisine</SelectItem>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine} className="rounded-xl font-bold">
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Select */}
        <div className="space-y-3">
          <Label htmlFor="difficulty-select" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
             <Zap className="h-3 w-3 text-primary" />
             Complexity
          </Label>
          <Select
            value={filters.difficulty || ''}
            onValueChange={(value) =>
              updateFilters({ difficulty: value || undefined })
            }
          >
            <SelectTrigger id="difficulty-select" className="h-12 rounded-2xl bg-background/40 border-border/20 focus:ring-primary/20 transition-all font-bold">
              <SelectValue placeholder="Any level" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl glass p-1">
              <SelectItem value="__any__" className="rounded-xl font-bold">Any difficulty</SelectItem>
              {DIFFICULTY_OPTIONS.map((d) => (
                <SelectItem key={d} value={d} className="rounded-xl font-bold">
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Max Prep Time Slider */}
        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prep-time-slider" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground/80">
               <Clock className="h-3 w-3 text-primary" />
               Max Prep Time
            </Label>
            <span className="text-sm font-black text-primary bg-primary/10 px-3 py-1 rounded-full">
              {filters.maxPrepTime ?? 120} min
            </span>
          </div>
          <div className="pt-2">
            <Slider
              id="prep-time-slider"
              min={5}
              max={120}
              step={5}
              value={filters.maxPrepTime !== undefined ? [filters.maxPrepTime] : [120]}
              onValueChange={([value]) => updateFilters({ maxPrepTime: value })}
            />
          </div>
        </div>
      </div>

      {/* Quick Filter ToggleGroup */}
      <div className="space-y-3 relative z-10 border-t border-border/10 pt-6">
        <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground/80">Popular Presets</Label>
        <ToggleGroup
          type="multiple"
          className="flex flex-wrap justify-start gap-3"
          onValueChange={(values) => {
            const difficulty = values.find((v) => DIFFICULTY_OPTIONS.includes(v as typeof DIFFICULTY_OPTIONS[number]));
            updateFilters({ difficulty: difficulty || undefined });
          }}
        >
          <ToggleGroupItem value="EASY" className="h-10 px-5 rounded-xl border-border/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-bold transition-all" aria-label="Easy recipes">
            Beginner Friendly
          </ToggleGroupItem>
          <ToggleGroupItem value="under-30" className="h-10 px-5 rounded-xl border-border/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-bold transition-all" aria-label="Under 30 minutes">
            Quick Meals
          </ToggleGroupItem>
          <ToggleGroupItem value="MEDIUM" className="h-10 px-5 rounded-xl border-border/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground font-bold transition-all" aria-label="Medium recipes">
            Intermediate
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

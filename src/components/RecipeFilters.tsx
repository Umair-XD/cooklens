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
    <div className={cn('flex flex-col gap-4 p-4 border rounded-lg bg-card', className)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cuisine Type Select */}
        <div className="space-y-2">
          <Label htmlFor="cuisine-select">Cuisine</Label>
          <Select
            value={filters.cuisineType || ''}
            onValueChange={(value) =>
              updateFilters({ cuisineType: value || undefined })
            }
          >
            <SelectTrigger id="cuisine-select">
              <SelectValue placeholder="Any cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">Any cuisine</SelectItem>
              {cuisines.map((cuisine) => (
                <SelectItem key={cuisine} value={cuisine}>
                  {cuisine}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty Select */}
        <div className="space-y-2">
          <Label htmlFor="difficulty-select">Difficulty</Label>
          <Select
            value={filters.difficulty || ''}
            onValueChange={(value) =>
              updateFilters({ difficulty: value || undefined })
            }
          >
            <SelectTrigger id="difficulty-select">
              <SelectValue placeholder="Any difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__any__">Any difficulty</SelectItem>
              {DIFFICULTY_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d.charAt(0) + d.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Max Prep Time Slider */}
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="prep-time-slider">Max Prep Time</Label>
            <span className="text-sm text-muted-foreground">
              {filters.maxPrepTime ?? 120} min
            </span>
          </div>
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

      {/* Quick Filter ToggleGroup */}
      <div className="space-y-2">
        <Label>Quick Filters</Label>
        <ToggleGroup
          type="multiple"
          className="flex-wrap gap-2"
          onValueChange={(values) => {
            const difficulty = values.find((v) => DIFFICULTY_OPTIONS.includes(v as typeof DIFFICULTY_OPTIONS[number]));
            updateFilters({ difficulty: difficulty || undefined });
          }}
        >
          <ToggleGroupItem value="EASY" aria-label="Easy recipes">
            Easy
          </ToggleGroupItem>
          <ToggleGroupItem value="MEDIUM" aria-label="Medium recipes">
            Medium
          </ToggleGroupItem>
          <ToggleGroupItem value="HARD" aria-label="Hard recipes">
            Hard
          </ToggleGroupItem>
          <ToggleGroupItem value="under-30" aria-label="Under 30 minutes">
            Under 30 min
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
}

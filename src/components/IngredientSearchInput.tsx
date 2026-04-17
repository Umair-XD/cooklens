"use client";

import * as React from "react";
import { Check } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";

export interface IngredientOption {
  id: string;
  canonicalName: string;
  aliases: string[];
}

interface IngredientSearchInputProps {
  onSelect: (ingredient: IngredientOption) => void;
  placeholder?: string;
}

import { Search, Plus } from "lucide-react";

export function IngredientSearchInput({
  onSelect,
  placeholder = "What ingredients do you have?",
}: IngredientSearchInputProps) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<IngredientOption[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  const debouncedSearch = React.useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(
          `/api/ingredients/search?q=${encodeURIComponent(searchQuery)}`,
        );
        if (!res.ok) throw new Error("Search failed");
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error("Ingredient search error:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [],
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelect = (ingredient: IngredientOption) => {
    onSelect(ingredient);
    setQuery("");
    setResults([]);
  };

  return (
    <div className="relative group">
      <div className="absolute -inset-1 bg-linear-to-r from-primary/20 to-accent/20 rounded-[2rem] blur opacity-25 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200 pointer-events-none" />
      <Command
        shouldFilter={false}
        className="relative rounded-[1.5rem] border border-border/40 selection:bg-primary/20 bg-background/60 shadow-lg backdrop-blur-xl overflow-hidden focus-within:border-primary/50 transition-all"
      >
        <div className="flex items-center px-4 border-b border-border/10 bg-muted/20">
          <Search className="h-5 w-5 text-muted-foreground/60 mr-2" />
          <CommandInput
            placeholder={placeholder}
            value={query}
            onValueChange={handleInputChange}
            className="h-14 border-none focus:ring-0 font-bold bg-transparent"
          />
        </div>
        <CommandList className="max-h-[300px] p-2">
          {isLoading ? (
            <div className="space-y-2 p-2">
              <Skeleton className="h-10 w-full rounded-xl" />
              <Skeleton className="h-10 w-full rounded-xl" />
            </div>
          ) : query && results.length === 0 ? (
            <CommandEmpty className="py-6 text-sm font-bold text-muted-foreground text-center">
              No matching ingredients discovered.
            </CommandEmpty>
          ) : null}
          <CommandGroup>
            {results.map((ingredient) => (
              <CommandItem
                key={ingredient.id}
                value={ingredient.canonicalName}
                onSelect={() => handleSelect(ingredient)}
                className="rounded-xl flex items-center justify-between p-3 aria-selected:bg-primary/5 aria-selected:text-primary cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground group-aria-selected:bg-primary/10 group-aria-selected:text-primary">
                    <Plus className="h-4 w-4" />
                  </div>
                  <span className="font-bold">{ingredient.canonicalName}</span>
                </div>
                <Check className="h-4 w-4 opacity-0 group-aria-selected:opacity-100" />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  );
}

function debounce<T extends (...args: never[]) => Promise<void>>(
  fn: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

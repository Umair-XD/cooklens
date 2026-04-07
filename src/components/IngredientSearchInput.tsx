'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Skeleton } from '@/components/ui/skeleton';

export interface IngredientOption {
  id: string;
  canonicalName: string;
  aliases: string[];
}

interface IngredientSearchInputProps {
  onSelect: (ingredient: IngredientOption) => void;
  placeholder?: string;
}

export function IngredientSearchInput({
  onSelect,
  placeholder = 'Search ingredients...',
}: IngredientSearchInputProps) {
  const [query, setQuery] = React.useState('');
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
          `/api/ingredients/search?q=${encodeURIComponent(searchQuery)}`
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        setResults(data);
      } catch (error) {
        console.error('Ingredient search error:', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    debouncedSearch(value);
  };

  const handleSelect = (ingredient: IngredientOption) => {
    onSelect(ingredient);
    setQuery('');
    setResults([]);
  };

  return (
    <Command shouldFilter={false} className="rounded-lg border">
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={handleInputChange}
      />
      <CommandList>
        {isLoading ? (
          <div className="p-2">
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <CommandEmpty>No ingredients found.</CommandEmpty>
        )}
        <CommandGroup>
          {results.map((ingredient) => (
            <CommandItem
              key={ingredient.id}
              value={ingredient.canonicalName}
              onSelect={() => handleSelect(ingredient)}
            >
              <Check className="mr-2 h-4 w-4" />
              {ingredient.canonicalName}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

function debounce<T extends (...args: never[]) => Promise<void>>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

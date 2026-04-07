'use client';

import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface IngredientOption {
  id: string;
  canonicalName: string;
  aliases: string[];
}

interface IngredientListProps {
  ingredients: IngredientOption[];
  onRemove: (id: string) => void;
  placeholder?: string;
}

export function IngredientList({
  ingredients,
  onRemove,
  placeholder = 'No ingredients selected',
}: IngredientListProps) {
  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{placeholder}</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {ingredients.map((ingredient) => (
        <Badge
          key={ingredient.id}
          variant="secondary"
          className="flex items-center gap-1"
        >
          {ingredient.canonicalName}
          <button
            type="button"
            onClick={() => onRemove(ingredient.id)}
            className="ml-1 rounded-full outline-none hover:bg-muted-foreground/20"
            aria-label={`Remove ${ingredient.canonicalName}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  );
}

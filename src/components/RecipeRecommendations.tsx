'use client';

import { RecipeCard, RecipeCardProps } from '@/components/RecipeCard';
import { RecipeCardSkeleton } from '@/components/RecipeCardSkeleton';

export interface RecipeRecommendationsProps {
  recipes: RecipeCardProps[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function RecipeRecommendations({
  recipes,
  loading = false,
  emptyMessage = 'No recipes found matching your ingredients.',
  className,
}: RecipeRecommendationsProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
        {Array.from({ length: 6 }).map((_, i) => (
          <RecipeCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (recipes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className || ''}`}>
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe._id.toString()}
          {...recipe}
        />
      ))}
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toggleFavorite } from '@/lib/actions/recipe.actions';

export interface FavoriteButtonProps {
  userId: string;
  recipeId: string;
  initialFavorite?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses: Record<string, string> = {
  sm: 'h-8 w-8 p-0',
  md: 'h-10 w-10 p-0',
  lg: 'h-12 w-12 p-0',
};

const iconSizes: Record<string, number> = {
  sm: 16,
  md: 20,
  lg: 24,
};

export function FavoriteButton({
  userId,
  recipeId,
  initialFavorite = false,
  size = 'md',
}: FavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isPending, startTransition] = useTransition();
  const [animate, setAnimate] = useState(false);

  const handleToggle = () => {
    if (isPending) return;

    const prev = isFavorite;
    setIsFavorite(!prev);
    setAnimate(true);

    setTimeout(() => setAnimate(false), 300);

    startTransition(async () => {
      const result = await toggleFavorite(userId, recipeId);
      if (result.success && result.isFavorite !== undefined) {
        setIsFavorite(result.isFavorite);
      } else {
        setIsFavorite(prev);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(sizeClasses[size], 'transition-colors')}
      onClick={handleToggle}
      disabled={isPending}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <Heart
        className={cn(
          'transition-all duration-300',
          animate && 'scale-125',
          isFavorite
            ? 'fill-red-500 text-red-500'
            : 'text-muted-foreground hover:text-red-500'
        )}
        size={iconSizes[size]}
      />
    </Button>
  );
}

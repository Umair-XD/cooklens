import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, ChefHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Types } from 'mongoose';

export interface RecipeCardProps {
  _id: string | Types.ObjectId;
  name: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  cuisineType: string;
  matchPercentage?: number;
  imageUrl?: string;
  className?: string;
}

const difficultyColors: Record<string, string> = {
  EASY: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  MEDIUM: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HARD: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

export function RecipeCard({
  name,
  difficulty,
  prepTimeMinutes,
  cookTimeMinutes,
  cuisineType,
  matchPercentage,
  imageUrl,
  className,
}: RecipeCardProps) {
  const totalTime = prepTimeMinutes + cookTimeMinutes;

  return (
    <Card className={cn('overflow-hidden transition-shadow hover:shadow-md cursor-pointer', className)}>
      <div className="relative w-full aspect-video bg-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ChefHat className="h-10 w-10" />
          </div>
        )}
        {matchPercentage !== undefined && (
          <Badge
            className="absolute top-2 right-2 bg-primary text-primary-foreground font-semibold"
          >
            {matchPercentage}% match
          </Badge>
        )}
      </div>
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-base leading-tight line-clamp-2">{name}</h3>
          <Badge
            variant="secondary"
            className={cn('shrink-0 text-xs', difficultyColors[difficulty])}
          >
            {difficulty.charAt(0) + difficulty.slice(1).toLowerCase()}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{cuisineType}</p>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Prep: {prepTimeMinutes}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Cook: {cookTimeMinutes}m</span>
          </div>
          <span className="text-xs">({totalTime}m total)</span>
        </div>
      </CardContent>
    </Card>
  );
}

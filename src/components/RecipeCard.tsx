import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChefHat, Flame, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Types } from "mongoose";
import { FavoriteButton } from "./FavoriteButton";

export interface RecipeCardProps {
  _id: string | Types.ObjectId;
  name: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | null;
  prepTimeMinutes: number | null;
  cookTimeMinutes: number | null;
  cuisineType: string;
  matchPercentage?: number;
  imageUrl?: string;
  className?: string;
  initialIsFavorite?: boolean;
}

const difficultyStyles: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HARD: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

export function RecipeCard({
  _id,
  name,
  difficulty,
  prepTimeMinutes,
  cookTimeMinutes,
  cuisineType,
  matchPercentage,
  imageUrl,
  className,
  initialIsFavorite = false,
}: RecipeCardProps) {
  const totalTime = (prepTimeMinutes || 0) + (cookTimeMinutes || 0);
  const id = typeof _id === "string" ? _id : _id.toString();
  const diff = difficulty || "MEDIUM";

  return (
    <div className="group relative h-full">
      <Card
        className={cn(
          "relative overflow-hidden border-border/50 bg-card/60 glass h-full flex flex-col transition-all duration-200 rounded-2xl",
          className,
        )}
      >
        <Link href={`/recipes/${id}`} className="block relative aspect-[4/3] bg-muted overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 bg-gradient-to-br from-muted to-muted/50">
              <ChefHat className="h-16 w-16" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
          
          <div className="absolute top-0 left-0 right-0 p-3 flex items-center justify-between z-30">
             <Badge className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md h-fit rounded-lg", difficultyStyles[diff])}>
               {diff}
             </Badge>
             <FavoriteButton recipeId={id} initialIsFavorite={initialIsFavorite} />
          </div>

          {matchPercentage !== undefined && (
            <div className="absolute top-12 right-3 z-30">
              <Badge className="bg-primary text-primary-foreground font-bold backdrop-blur-sm border-white/20 px-2 py-1 rounded-lg">
                <Star className="h-3 w-3 mr-1 fill-current" />
                {matchPercentage}% Match
              </Badge>
            </div>
          )}

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
             <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">{cuisineType}</span>
             <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[11px] font-bold border border-white/10">
                <Clock className="h-3.5 w-3.5" />
                {totalTime}m
             </div>
          </div>
        </Link>
        
        <Link href={`/recipes/${id}`} className="flex flex-col flex-1">
          <CardHeader className="p-4 pb-2">
            <h3 className="font-bold text-lg leading-tight line-clamp-2 hover:text-primary transition-colors">
              {name}
            </h3>
          </CardHeader>
          
          <CardContent className="p-4 pt-0">
            <div className="flex items-center justify-between gap-4 py-3 border-t border-border/30">
              <div className="flex flex-col gap-0.5">
                 <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">Prep Time</span>
                 <span className="text-xs font-bold">{prepTimeMinutes ?? "—"} min</span>
              </div>
              <div className="flex flex-col gap-0.5 items-end">
                 <span className="text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">Cook Time</span>
                 <span className="text-xs font-bold">{cookTimeMinutes ?? "—"} min</span>
              </div>
            </div>
          </CardContent>
        </Link>
      </Card>
    </div>
  );
}

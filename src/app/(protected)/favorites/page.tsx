import { Suspense } from "react";
import { getServerSessionSafe } from "@/lib/auth";
import { getUserFavorites } from "@/lib/actions/favorites.actions";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeCardSkeleton } from "@/components/RecipeCardSkeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { Heart, Search, Bookmark, History, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <RecipeCardSkeleton key={i} />
      ))}
    </div>
  );
}

async function FavoritesList({ userId }: { userId: string }) {
  const favorites = await getUserFavorites(userId);

  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center sm:py-32">
        <div className="flex max-w-lg flex-col items-center gap-6 rounded-xl border-2 border-dashed border-border/50 p-8 sm:p-12">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
             <div className="relative h-16 w-16 bg-background rounded-xl border flex items-center justify-center text-muted-foreground/30">
                <Bookmark className="h-8 w-8" />
             </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black font-outfit tracking-tighter">Your list is empty</h2>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto text-sm">
              Save recipes you love and they'll all show up here for quick access later.
            </p>
          </div>
          <Link href="/recipes">
            <Button className="rounded-xl font-bold px-8 h-12 shadow-lg shadow-primary/20 font-outfit">
              Find Recipes
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
      {favorites.map((recipe) => (
        <div key={recipe.id}>
          <RecipeCard
            _id={recipe.id}
            name={recipe.name}
            cuisineType={recipe.cuisineType}
            difficulty={recipe.difficulty}
            prepTimeMinutes={recipe.prepTimeMinutes}
            cookTimeMinutes={recipe.cookTimeMinutes}
            imageUrl={recipe.imageUrl}
            initialIsFavorite={true}
          />
        </div>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <div className="bg-background/50 min-h-dvh">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end sm:mb-10">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <Heart className="h-4 w-4 fill-current" />
                Favorites
             </div>
             <h1 className="text-3xl font-black font-outfit tracking-tighter sm:text-4xl lg:text-5xl">
               Your <span className="text-primary italic">Recipes</span>
             </h1>
          </div>
        </div>

        <Suspense fallback={<FavoritesSkeleton />}>
          <FavoritesListWrapper />
        </Suspense>
      </div>
    </div>
  );
}

async function FavoritesListWrapper() {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) return null;
  return <FavoritesList userId={session.user.id} />;
}

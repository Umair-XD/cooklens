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
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-12 max-w-lg border-2 border-dashed border-border/50 rounded-[32px] flex flex-col items-center gap-6">
          <div className="relative">
             <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
             <div className="relative h-16 w-16 bg-background rounded-2xl border flex items-center justify-center text-muted-foreground/30">
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
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((recipe, i) => (
        <div key={recipe.id} className="animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
          <RecipeCard
            _id={recipe.id}
            name={recipe.name}
            cuisineType={recipe.cuisineType}
            difficulty={recipe.difficulty}
            prepTimeMinutes={recipe.prepTimeMinutes}
            cookTimeMinutes={recipe.cookTimeMinutes}
            initialIsFavorite={true}
          />
        </div>
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <div className="bg-background/50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="space-y-2">
             <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
                <Heart className="h-4 w-4 fill-current" />
                Favorites
             </div>
             <h1 className="text-4xl font-black font-outfit tracking-tighter lg:text-5xl">
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

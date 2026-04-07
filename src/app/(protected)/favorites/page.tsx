import { Suspense } from "react";
import { getServerSessionSafe } from "@/lib/auth";
import { getUserFavorites } from "@/lib/actions/favorites.actions";
import { RecipeCard } from "@/components/RecipeCard";
import { RecipeCardSkeleton } from "@/components/RecipeCardSkeleton";

function FavoritesSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">
          You haven't saved any recipes yet.
        </p>
        <p className="text-sm text-muted-foreground">
          Browse recipes and click the heart icon to save your favorites.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {favorites.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          _id={recipe.id}
          name={recipe.name}
          cuisineType={recipe.cuisineType}
          difficulty={recipe.difficulty}
          prepTimeMinutes={recipe.prepTimeMinutes}
          cookTimeMinutes={recipe.cookTimeMinutes}
          matchPercentage={100}
        />
      ))}
    </div>
  );
}

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">My Favorites</h1>
      <Suspense fallback={<FavoritesSkeleton />}>
        <FavoritesListWrapper />
      </Suspense>
    </div>
  );
}

async function FavoritesListWrapper() {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) return null;
  return <FavoritesList userId={session.user.id} />;
}

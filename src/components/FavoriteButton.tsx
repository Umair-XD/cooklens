"use client";

import { useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { toggleFavorite } from "@/lib/actions/favorites.actions";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useRouter, usePathname } from "next/navigation";

interface FavoriteButtonProps {
  recipeId: string;
  initialIsFavorite: boolean;
  className?: string;
}

export function FavoriteButton({
  recipeId,
  initialIsFavorite,
  className,
}: FavoriteButtonProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [isFav, setIsFav] = useState(initialIsFavorite);
  const [isPending, startTransition] = useTransition();

  const handleToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user?.id) {
      toast.error("Please sign in to save recipes");
      return;
    }

    // Optimistic update
    const previousState = isFav;
    setIsFav(!previousState);

    startTransition(async () => {
      try {
        const result = await toggleFavorite(session.user.id, recipeId);
        setIsFav(result.isFavorite);
        toast.success(result.isFavorite ? "Saved to favorites" : "Removed from favorites");
        
        // If we're on the favorites page and we un-favorite, refresh to remove the card
        if (!result.isFavorite && pathname === "/favorites") {
          router.refresh();
        }
      } catch (error) {
        setIsFav(previousState);
        toast.error("Failed to update collection");
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "h-9 w-9 rounded-full bg-white/90 backdrop-blur-md shadow-md transition-all hover:scale-110 active:scale-95 group/fav border border-border/10",
        isFav ? "text-rose-500" : "text-muted-foreground",
        className
      )}
      onClick={handleToggle}
      disabled={isPending}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-all",
          isFav ? "fill-current scale-110" : "group-hover/fav:fill-rose-500/20"
        )}
      />
    </Button>
  );
}

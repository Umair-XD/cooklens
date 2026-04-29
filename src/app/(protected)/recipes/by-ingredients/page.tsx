"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, ChefHat, Sparkles, Plus, LayoutGrid } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchResultsSkeleton } from "@/components/SearchResultsSkeleton";
import { cn } from "@/lib/utils";

interface Ingredient {
  id: string;
  canonicalName: string;
}

interface RecipeResult {
  _id: string;
  name: string;
  cuisineType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  imageUrl?: string;
  matchPercentage: number;
  matchedIngredients: number;
  totalRequired: number;
}

export default function ByIngredientsPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [selected, setSelected] = useState<Ingredient[]>([]);
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/ingredients/search?q=${encodeURIComponent(q)}`);
        const data = await res.json();
        const raw: { id: string; canonicalName: string }[] = Array.isArray(data) ? data : [];
        const items: Ingredient[] = raw.map((i) => ({
          id: i.id,
          canonicalName: i.canonicalName,
        }));
        const filtered = items.filter((i) => !selected.some((s) => s.id === i.id));
        setSuggestions(filtered);
        setShowSuggestions(filtered.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  }, [selected]);

  const addIngredient = (ing: Ingredient) => {
    if (selected.some((s) => s.id === ing.id)) return;
    setSelected((prev) => [...prev, ing]);
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeIngredient = (id: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== id));
  };

  const findRecipes = useCallback(async () => {
    if (selected.length === 0) return;
    setIsFetching(true);
    setNoResults(false);
    setResults([]);

    try {
      const [recipesRes] = await Promise.all([
        fetch(`/api/recipes/by-ingredients?ids=${selected.map((s) => s.id).join(",")}`),
        fetch("/api/favorites/ids")
          .then((r) => r.json())
          .then((d) => setFavoriteIds(new Set(d.favoriteIds ?? [])))
          .catch(() => {}),
      ]);
      const data = await recipesRes.json();
      const recipes: RecipeResult[] = data.recipes ?? [];
      if (recipes.length === 0) {
        setNoResults(true);
      } else {
        setResults(recipes);
      }
    } catch {
      setNoResults(true);
    } finally {
      setIsFetching(false);
    }
  }, [selected]);

  const hasSearched = results.length > 0 || noResults;

  return (
    <div className="bg-background/50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-3">
            <Sparkles className="h-4 w-4" />
            Ingredient Match
          </div>
          <h1 className="text-4xl font-black font-outfit tracking-tighter lg:text-5xl mb-2">
            What's in your <span className="text-primary italic">kitchen?</span>
          </h1>
          <p className="text-muted-foreground font-medium text-sm max-w-lg">
            Add the ingredients you have and we'll find the best recipes you can make right now.
          </p>
        </div>

        {/* Ingredient selector */}
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="glass rounded-2xl border border-border/50 shadow-premium p-4 sm:p-5">

            {/* Selected tags */}
            {selected.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selected.map((ing) => (
                  <Badge
                    key={ing.id}
                    className="pl-3 pr-1.5 py-1.5 rounded-xl bg-primary/10 text-primary border border-primary/20 font-bold text-xs gap-1.5 hover:bg-primary/20 transition-colors cursor-default"
                  >
                    {ing.canonicalName}
                    <button
                      type="button"
                      onClick={() => removeIngredient(ing.id)}
                      className="ml-0.5 rounded-full p-0.5 hover:bg-primary/30 transition-colors focus:outline-none"
                      aria-label={`Remove ${ing.canonicalName}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {/* Search input + find button */}
            <div className="flex flex-col sm:flex-row gap-2 relative">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Type an ingredient (e.g. chicken, garlic…)"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                  }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && suggestions.length > 0) {
                      addIngredient(suggestions[0]);
                    }
                  }}
                  className="pl-10 h-12 rounded-xl bg-background/60 border-border/50 focus-visible:ring-primary/30"
                />

                {/* Autocomplete dropdown */}
                {showSuggestions && (
                  <div
                    ref={suggestionsRef}
                    className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-border/50 bg-card/95 backdrop-blur-xl shadow-premium overflow-hidden"
                  >
                    {suggestions.map((ing) => (
                      <button
                        key={ing.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addIngredient(ing);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-primary/5 hover:text-primary transition-colors text-left"
                      >
                        <Plus className="h-3.5 w-3.5 text-primary/60 shrink-0" />
                        {ing.canonicalName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={findRecipes}
                disabled={selected.length === 0 || isFetching}
                className="h-12 px-8 rounded-xl font-bold shadow-none shrink-0"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                {isFetching ? "Finding…" : "Find Recipes"}
              </Button>
            </div>

            {selected.length === 0 && (
              <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40 text-center">
                Add at least one ingredient to get started
              </p>
            )}
          </div>
        </div>

        {/* Results */}
        {isFetching && <SearchResultsSkeleton />}

        {!isFetching && noResults && (
          <div className="py-32 text-center rounded-2xl border border-dashed border-border/60 bg-muted/5">
            <div className="mb-4 inline-flex p-4 rounded-full bg-background border shadow-sm">
              <ChefHat className="h-8 w-8 text-muted-foreground/20" />
            </div>
            <h3 className="text-xl font-bold mb-2">No matches found</h3>
            <p className="text-muted-foreground max-w-xs mx-auto text-sm">
              Try adding more ingredients or different ones.
            </p>
          </div>
        )}

        {!isFetching && results.length > 0 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-2 px-2">
              <LayoutGrid className="h-4 w-4 text-primary" />
              <span className="text-sm font-bold text-muted-foreground/80">
                {results.length} recipe{results.length !== 1 ? "s" : ""} matched
              </span>
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((recipe, i) => (
                <div
                  key={recipe._id}
                  className="animate-in fade-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <RecipeCard
                    _id={recipe._id}
                    name={recipe.name}
                    cuisineType={recipe.cuisineType}
                    difficulty={recipe.difficulty}
                    prepTimeMinutes={recipe.prepTimeMinutes}
                    cookTimeMinutes={recipe.cookTimeMinutes}
                    imageUrl={recipe.imageUrl}
                    matchPercentage={recipe.matchPercentage}
                    initialIsFavorite={favoriteIds.has(recipe._id)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder when nothing searched yet */}
        {!isFetching && !hasSearched && selected.length === 0 && (
          <div className="py-24 text-center animate-in fade-in duration-700">
            <div className="inline-flex p-6 rounded-full bg-primary/5 border border-primary/10 mb-6">
              <ChefHat className="h-12 w-12 text-primary/30" />
            </div>
            <h3 className={cn("text-xl font-black font-outfit tracking-tight mb-2")}>
              Your pantry, your recipes
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm mx-auto">
              Search for ingredients above and we'll match them to recipes you can cook today.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

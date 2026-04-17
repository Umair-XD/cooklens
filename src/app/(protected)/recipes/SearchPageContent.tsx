"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X, Filter, LayoutGrid, ChevronRight, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchResultsSkeleton } from "@/components/SearchResultsSkeleton";
import { cn } from "@/lib/utils";

const CUISINES = [
  "All",
  "Pakistani Recipes",
  "Dessert Recipes",
  "Continental Recipes",
];

const DIFFICULTIES = ["All", "EASY", "MEDIUM", "HARD"];

interface RecipeResult {
  _id: string;
  name: string;
  cuisineType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  imageUrl?: string;
}

interface Filters {
  cuisine: string;
  maxCookTime: number;
  difficulty: string;
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasSearched = useRef(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Filters>(() => ({
    cuisine: searchParams.get("cuisine") || "All",
    maxCookTime: Number(searchParams.get("maxCookTime")) || 120,
    difficulty: searchParams.get("difficulty") || "All",
  }));

  const fetchFavoriteIds = async () => {
    try {
      const res = await fetch("/api/favorites/ids");
      const data = await res.json();
      setFavoriteIds(new Set(data.favoriteIds));
    } catch (err) {
      console.error("Failed to fetch favorites", err);
    }
  };

  const doSearch = useCallback(
    async (q: string, f: Filters) => {
      setIsLoading(true);
      setNoResults(false);

      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (f.cuisine !== "All") p.set("cuisine", f.cuisine);
      if (f.maxCookTime < 120) p.set("maxCookTime", String(f.maxCookTime));
      if (f.difficulty !== "All") p.set("difficulty", f.difficulty);

      router.push(`/recipes?${p.toString()}`, { scroll: false });

      try {
        const [res, _] = await Promise.all([
          fetch(`/api/recipes/search?${p.toString()}`),
          fetchFavoriteIds()
        ]);
        const data = await res.json();
        const recipes = Array.isArray(data.recipes) ? data.recipes : [];
        if (recipes.length === 0) {
          setNoResults(true);
          setResults([]);
        } else {
          setResults(recipes);
          setNoResults(false);
        }
      } catch {
        setNoResults(true);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    if (hasSearched.current) return;
    hasSearched.current = true;

    const q = searchParams.get("q") || "";
    const f: Filters = {
      cuisine: searchParams.get("cuisine") || "All",
      maxCookTime: Number(searchParams.get("maxCookTime")) || 120,
      difficulty: searchParams.get("difficulty") || "All",
    };

    setQuery(q);
    setFilters(f);
    doSearch(q, f);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    hasSearched.current = false;
    doSearch(query, filters);
  };

  const updateFilter = <K extends keyof Filters>(key: K, val: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: val }));

  // Shared filter UI
  const FilterFields = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
           <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Style</Label>
        </div>
        <Select
          value={filters.cuisine}
          onValueChange={(v) => updateFilter("cuisine", v)}
        >
          <SelectTrigger className="h-11 bg-background/50 rounded-xl">
            <SelectValue placeholder="All styles" />
          </SelectTrigger>
          <SelectContent className="rounded-xl glass z-[200]">
            {CUISINES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "Any" : c.replace(" Recipes", "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Time limit</Label>
            <span className="text-primary text-xs font-bold">{filters.maxCookTime} min</span>
        </div>
        <Slider
          value={[filters.maxCookTime]}
          onValueChange={([v]) => updateFilter("maxCookTime", v)}
          min={5}
          max={120}
          step={5}
          className="py-2"
        />
      </div>

      <div className="space-y-3">
        <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Skill level</Label>
        <Select
          value={filters.difficulty}
          onValueChange={(v) => updateFilter("difficulty", v)}
        >
          <SelectTrigger className="h-11 bg-background/50 rounded-xl">
            <SelectValue placeholder="Any skill" />
          </SelectTrigger>
          <SelectContent className="rounded-xl glass z-[200]">
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>
                {d === "All" ? "Any" : d.charAt(0) + d.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full h-11 rounded-xl shadow-lg shadow-primary/20 font-bold"
        onClick={() => {
          hasSearched.current = false;
          doSearch(query, filters);
          setMobileOpen(false);
        }}
      >
        Show Results
      </Button>
    </div>
  );

  const hasActiveFilters =
    filters.cuisine !== "All" ||
    filters.difficulty !== "All" ||
    filters.maxCookTime < 120;

  return (
    <div className="bg-background/50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs">
              <RotateCcw className="h-4 w-4" />
              Recipe Discovery
            </div>
            <h1 className="text-4xl font-black font-outfit tracking-tighter lg:text-5xl">
              Find your next <span className="text-primary italic">Meal</span>
            </h1>
          </div>
        </div>

        {/* Search bar Area */}
        <div className="mb-12 glass sm:p-1.5 p-1.5 rounded-2xl border border-border/50 shadow-premium animate-in fade-in slide-in-from-bottom-2 duration-500 relative z-10 w-full">
           <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <div className="relative flex-1 group bg-background/50 sm:bg-transparent rounded-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="text"
                placeholder="What do you feel like cooking?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-12 h-12 sm:h-14 bg-transparent border-none focus:outline-none focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-within:ring-0 text-sm sm:text-base font-medium placeholder:text-muted-foreground/40 rounded-2xl shadow-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => { setQuery(""); }}
                  className="absolute right-4 top-1/2 h-7 w-7 flex items-center justify-center -translate-y-1/2 rounded-full bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors focus:outline-none focus:ring-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
               {/* Mobile: filter trigger */}
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "sm:hidden flex-1 h-12 rounded-xl border border-border/50 glass font-bold text-sm shadow-none focus:ring-0 focus-visible:ring-offset-0 focus-visible:ring-0",
                  hasActiveFilters && "border-primary/50 bg-primary/5 text-primary"
                )}
                onClick={() => setMobileOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>

              <Button type="submit" className="flex-1 sm:flex-none h-12 sm:h-14 px-8 rounded-[1rem] font-bold shadow-none text-sm sm:text-base border border-transparent transition-transform hover:-translate-y-0.5 active:scale-95 focus:ring-0 focus-visible:ring-offset-0 focus-visible:ring-0">
                Search
              </Button>
            </div>
          </form>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Desktop sidebar */}
          <aside id="filters-panel" className="hidden lg:block w-72 shrink-0 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="sticky top-24 rounded-2xl border border-border/50 bg-card/60 p-6 glass shadow-premium">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 font-bold text-sm">
                   <Filter className="h-4 w-4 text-primary" />
                   Filter by
                </div>
                {hasActiveFilters && (
                  <button
                    className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground hover:text-primary transition-colors"
                    onClick={() => {
                      setFilters({
                        cuisine: "All",
                        maxCookTime: 120,
                        difficulty: "All",
                      });
                      hasSearched.current = false;
                      doSearch(query, {
                        cuisine: "All",
                        maxCookTime: 120,
                        difficulty: "All",
                      });
                    }}
                  >
                    Reset
                  </button>
                )}
              </div>
              <FilterFields />
            </div>
          </aside>

          {/* Main content */}
          <div className="min-w-0 flex-1 animate-in fade-in slide-in-from-right-4 duration-700">
            {isLoading && <SearchResultsSkeleton />}

            {!isLoading && noResults && (
              <div className="py-32 text-center rounded-2xl border border-dashed border-border/60 bg-muted/5">
                <div className="mb-4 inline-flex p-4 rounded-full bg-background border shadow-sm">
                   <Search className="h-8 w-8 text-muted-foreground/20" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nothing found</h3>
                <p className="text-muted-foreground max-w-xs mx-auto text-sm">
                   Try adjusting your filters or search for something else.
                </p>
              </div>
            )}

            {!isLoading && results.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                   <div className="flex items-center gap-2">
                      <LayoutGrid className="h-4 w-4 text-primary" />
                      <span className="text-sm font-bold text-muted-foreground/80">
                        Found {results.length} recipes
                      </span>
                   </div>
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
                        initialIsFavorite={favoriteIds.has(recipe._id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile filter panel overlay */}
        {mounted && createPortal(
          <div 
            className={cn(
              "fixed inset-0 z-100 lg:hidden transition-opacity duration-300",
              mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
            )}
            style={{ isolation: "isolate" }}
          >
            <div
              className="absolute inset-0 bg-black/80"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />
            <div 
              className={cn(
                "absolute bottom-0 left-0 right-0 max-h-[90vh] pb-12 glass bg-background/60 backdrop-blur-xl rounded-t-[2.5rem] p-8 shadow-premium overflow-y-auto border-t border-border/50 transition-transform duration-300 ease-out",
                mobileOpen ? "translate-y-0" : "translate-y-full"
              )}
            >
              <div className="w-12 h-1.5 bg-muted/80 rounded-full mx-auto mb-8" />
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black font-outfit tracking-tighter">Refine Search</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-muted/50 hover:bg-accent hover:text-foreground h-10 w-10 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <FilterFields />
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  className="mt-4 w-full text-muted-foreground text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors"
                  onClick={() => {
                    setFilters({
                      cuisine: "All",
                      maxCookTime: 120,
                      difficulty: "All",
                    });
                    hasSearched.current = false;
                    doSearch(query, {
                      cuisine: "All",
                      maxCookTime: 120,
                      difficulty: "All",
                    });
                  }}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  );
}

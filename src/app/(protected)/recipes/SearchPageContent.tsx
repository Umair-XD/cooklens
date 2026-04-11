"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
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

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [filters, setFilters] = useState<Filters>(() => ({
    cuisine: searchParams.get("cuisine") || "All",
    maxCookTime: Number(searchParams.get("maxCookTime")) || 120,
    difficulty: searchParams.get("difficulty") || "All",
  }));

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
        const res = await fetch(`/api/recipes/search?${p.toString()}`);
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
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="text-[13px]">Cuisine</Label>
        <Select
          value={filters.cuisine}
          onValueChange={(v) => updateFilter("cuisine", v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="All cuisines" />
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map((c) => (
              <SelectItem key={c} value={c}>
                {c === "All" ? "All" : c.replace(" Recipes", "")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-[13px]">
          Max cook time: {filters.maxCookTime} min
        </Label>
        <Slider
          value={[filters.maxCookTime]}
          onValueChange={([v]) => updateFilter("maxCookTime", v)}
          min={5}
          max={120}
          step={5}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[13px]">Difficulty</Label>
        <Select
          value={filters.difficulty}
          onValueChange={(v) => updateFilter("difficulty", v)}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Any difficulty" />
          </SelectTrigger>
          <SelectContent>
            {DIFFICULTIES.map((d) => (
              <SelectItem key={d} value={d}>
                {d === "All" ? "Any" : d.charAt(0) + d.slice(1).toLowerCase()}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        className="w-full"
        onClick={() => {
          hasSearched.current = false;
          doSearch(query, filters);
          setMobileOpen(false);
        }}
      >
        Apply filters
      </Button>
    </div>
  );

  const hasActiveFilters =
    filters.cuisine !== "All" ||
    filters.difficulty !== "All" ||
    filters.maxCookTime < 120;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight mb-4">Recipes</h1>

        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, ingredient, or cuisine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>

          {/* Desktop: filter toggle button */}
          <Button
            type="button"
            variant="outline"
            className={`hidden sm:inline-flex h-11 gap-1.5 ${hasActiveFilters ? "border-primary text-primary" : ""}`}
            onClick={() => {
              const el = document.getElementById("filters-panel");
              el?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                ✓
              </span>
            )}
          </Button>

          {/* Mobile: sheet trigger */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`sm:hidden h-11 w-11 ${hasActiveFilters ? "border-primary text-primary" : ""}`}
            onClick={() => setMobileOpen(true)}
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>

          <Button type="submit" className="h-11 px-6">
            Search
          </Button>
        </form>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside id="filters-panel" className="hidden sm:block w-64 shrink-0">
          <div className="sticky top-24 rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold mb-4">Filters</h2>
            <FilterFields />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-muted-foreground"
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
                Clear all
              </Button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {isLoading && <SearchResultsSkeleton />}

          {!isLoading && noResults && (
            <div className="py-20 text-center">
              <p className="text-lg font-medium text-muted-foreground">
                No recipes found
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Try broadening your search or removing filters
              </p>
            </div>
          )}

          {!isLoading && results.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                {results.length} recipe{results.length !== 1 ? "s" : ""}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {results.map((recipe) => (
                  <RecipeCard
                    key={recipe._id}
                    _id={recipe._id}
                    name={recipe.name}
                    cuisineType={recipe.cuisineType}
                    difficulty={recipe.difficulty}
                    prepTimeMinutes={recipe.prepTimeMinutes}
                    cookTimeMinutes={recipe.cookTimeMinutes}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Mobile filter sheet (pure CSS) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-background shadow-xl p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Filters</h2>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FilterFields />
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 w-full text-muted-foreground"
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
                Clear all
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

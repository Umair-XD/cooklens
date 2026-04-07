"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RecipeCard } from "@/components/RecipeCard";
import { SearchResultsSkeleton } from "@/components/SearchResultsSkeleton";

interface RecipeResult {
  _id: string;
  name: string;
  cuisineType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prepTimeMinutes: number;
  cookTimeMinutes: number;
}

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [results, setResults] = useState<RecipeResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [filters, setFilters] = useState({
    cuisine: "",
    maxPrepTime: 120,
    difficulty: "",
  });

  const performSearch = useCallback(
    async (searchQuery: string, searchFilters: typeof filters) => {
      setIsLoading(true);
      setNoResults(false);

      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (searchFilters.cuisine) params.set("cuisine", searchFilters.cuisine);
      if (searchFilters.maxPrepTime < 120)
        params.set("maxPrepTime", String(searchFilters.maxPrepTime));
      if (searchFilters.difficulty)
        params.set("difficulty", searchFilters.difficulty);

      router.push(`/recipes?${params.toString()}`);

      try {
        const res = await fetch(`/api/recipes/search?${params.toString()}`);
        const data = await res.json();

        if (data.recipes.length === 0) {
          setNoResults(true);
          setResults([]);
        } else {
          setResults(data.recipes);
          setNoResults(false);
        }
      } catch (error) {
        console.error("Search error:", error);
        setNoResults(true);
      } finally {
        setIsLoading(false);
      }
    },
    [router],
  );

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      setQuery(q);
      performSearch(q, filters);
    }
  }, [searchParams, performSearch, filters]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query, filters);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 flex items-center gap-3">
        <form onSubmit={handleSubmit} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search recipes by name, ingredient, or cuisine..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Search Filters</SheetTitle>
                <SheetDescription>
                  Refine your search with advanced filters
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Cuisine Type</Label>
                  <Select
                    value={filters.cuisine}
                    onValueChange={(val) =>
                      setFilters((f) => ({ ...f, cuisine: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="italian">Italian</SelectItem>
                      <SelectItem value="chinese">Chinese</SelectItem>
                      <SelectItem value="japanese">Japanese</SelectItem>
                      <SelectItem value="mexican">Mexican</SelectItem>
                      <SelectItem value="indian">Indian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Prep Time: {filters.maxPrepTime} min</Label>
                  <Slider
                    value={[filters.maxPrepTime]}
                    onValueChange={([val]) =>
                      setFilters((f) => ({ ...f, maxPrepTime: val }))
                    }
                    min={5}
                    max={120}
                    step={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={filters.difficulty}
                    onValueChange={(val) =>
                      setFilters((f) => ({ ...f, difficulty: val }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <SheetFooter>
                <SheetClose asChild>
                  <Button onClick={() => performSearch(query, filters)}>
                    Apply Filters
                  </Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </form>
      </div>

      {isLoading && <SearchResultsSkeleton />}

      {!isLoading && noResults && (
        <div className="py-20 text-center">
          <p className="text-lg text-muted-foreground">
            No recipes found. Try broadening your search criteria.
          </p>
        </div>
      )}

      {!isLoading && !noResults && results.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
      )}
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  UtensilsCrossed,
  ScrollText,
  Activity,
  CheckCircle2,
  MessageSquare,
} from "lucide-react";
import { StepList } from "@/components/StepList";
import { NutritionPanel } from "@/components/NutritionPanel";
import { ServingsAdjuster } from "@/components/ServingsAdjuster";

interface IngredientWithDetails {
  ingredientId: any;
  quantity: number;
  unit: string;
  canonicalName: string;
}

interface RecipeDetailClientProps {
  recipe: {
    _id: string;
    name: string;
    cuisineType: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
    prepTimeMinutes: number;
    cookTimeMinutes: number;
    servings: number;
    utensils: string[];
    ingredients: IngredientWithDetails[];
    steps: { stepNumber: number; instruction: string }[];
    nutrition: {
      caloriesPerServing: number;
      proteinGrams: number;
      carbsGrams: number;
      fatGrams: number;
    };
  };
  substitutionPanel: React.ReactNode;
}

export function RecipeDetailClient({
  recipe,
  substitutionPanel,
}: RecipeDetailClientProps) {
  const [servings, setServings] = useState(recipe.servings);
  const router = useRouter();
  const scale = servings / recipe.servings;

  const handleAskAI = () => {
    const recipeContext = {
      id: recipe._id,
      name: recipe.name,
      cuisineType: recipe.cuisineType,
      difficulty: recipe.difficulty,
      servings: recipe.servings,
      prepTimeMinutes: recipe.prepTimeMinutes,
      cookTimeMinutes: recipe.cookTimeMinutes,
      utensils: recipe.utensils,
      ingredients: recipe.ingredients.map((ingredient) => ({
        name: ingredient.canonicalName,
        quantity: ingredient.quantity,
        unit: ingredient.unit,
      })),
      steps: recipe.steps.map((step) => ({
        stepNumber: step.stepNumber,
        instruction: step.instruction,
      })),
      nutrition: recipe.nutrition,
    };

    sessionStorage.setItem(
      `chat:recipe:${recipe._id}`,
      JSON.stringify(recipeContext),
    );
    router.push(
      `/chat?recipeId=${encodeURIComponent(recipe._id)}&recipeName=${encodeURIComponent(recipe.name)}`,
    );
  };

  return (
    <div className="lg:col-span-2 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black font-outfit tracking-tighter">
            Recipe Dashboard
          </h2>
          <p className="text-sm text-muted-foreground font-medium">
            Scale ingredients and nutrition for any group size.
          </p>
        </div>
        <div className="flex w-full flex-col items-stretch gap-3 md:w-auto md:flex-row md:items-center">
          <Button
            type="button"
            onClick={handleAskAI}
            className="h-11 w-full rounded-2xl px-5 font-bold shadow-sm md:w-auto"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Ask AI
          </Button>
          <div className="w-full md:w-auto">
            <ServingsAdjuster
              value={servings}
              onChange={setServings}
              min={1}
              max={99}
            />
          </div>
        </div>
      </div>

      <div className="p-1 overflow-hidden bg-card/60 backdrop-blur-xl border border-border/50 rounded-[2rem]">
        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="w-full justify-start rounded-none bg-muted/20 p-1 h-14 border-b border-border/50">
            <TabsTrigger
              value="ingredients"
              className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <UtensilsCrossed className="h-4 w-4 mr-2" />
              Ingredients
            </TabsTrigger>
            <TabsTrigger
              value="steps"
              className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <ScrollText className="h-4 w-4 mr-2" />
              Steps
            </TabsTrigger>
            <TabsTrigger
              value="nutrition"
              className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <Activity className="h-4 w-4 mr-2" />
              Nutrition
            </TabsTrigger>
            <TabsTrigger
              value="substitutions"
              className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Swaps
            </TabsTrigger>
          </TabsList>

          <div className="p-10">
            <TabsContent value="ingredients" className="mt-0 outline-none">
              <div className="mb-8">
                <h2 className="text-xl font-black font-outfit tracking-tight mb-2">
                  What you'll need
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Quantities adjusted for {servings} person{servings !== 1 ? "s" : ""}.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipe.ingredients.map((ing, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-2xl border border-border/50 p-4 bg-card/40 glass group hover:border-primary/30 transition-all animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                      <span className="font-bold text-sm tracking-tight text-foreground/90">
                        {ing.canonicalName}
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-lg bg-primary/5 text-primary border-primary/10 font-black font-outfit"
                    >
                      {Number((ing.quantity * scale).toFixed(2))} {ing.unit}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="steps" className="mt-0 outline-none">
              <div className="mb-8">
                <h2 className="text-xl font-black font-outfit tracking-tight mb-2">
                  How to cook it
                </h2>
                <p className="text-sm text-muted-foreground font-medium">
                  Follow these steps for a perfect result every time.
                </p>
              </div>
              <StepList steps={recipe.steps} />
            </TabsContent>

            <TabsContent value="nutrition" className="mt-0 outline-none">
               {/* 
                Since NutritionPanel has its own internal state, 
                we key it with servings to force a re-render when servings change 
                OR we can update NutritionPanel to be a simple display component.
                Let's use the key approach for quick integration, 
                or pass the scale factor if supported.
               */}
              <NutritionPanel
                nutrition={{
                  caloriesPerServing: recipe.nutrition.caloriesPerServing,
                  proteinGrams: recipe.nutrition.proteinGrams,
                  carbsGrams: recipe.nutrition.carbsGrams,
                  fatGrams: recipe.nutrition.fatGrams,
                }}
                baseServings={recipe.servings}
                currentServings={servings}
                onServingsChange={setServings}
              />
            </TabsContent>

            <TabsContent value="substitutions" className="mt-0 outline-none">
              {substitutionPanel}
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

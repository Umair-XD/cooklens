import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Clock,
  ChefHat,
  UtensilsCrossed,
  Globe,
  Flame,
  Users,
  ScrollText,
  CheckCircle2,
  Info,
  Activity,
} from "lucide-react";
import { dbConnect } from "@/lib/db/connect";
import {
  Recipe,
  type IRecipe,
  type IRecipeIngredient,
  type IRecipeStep,
  type INutrition,
} from "@/lib/db/models/Recipe";
import { Ingredient, type IIngredient } from "@/lib/db/models/Ingredient";
import { StepList, type RecipeStep } from "@/components/StepList";
import { NutritionPanel } from "@/components/NutritionPanel";
import { SubstitutionPanel } from "@/components/SubstitutionPanel";
import { RecipeDetailSkeleton } from "@/components/RecipeDetailSkeleton";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import {
  toggleFavorite,
  isFavorite as checkIsFavorite,
} from "@/lib/actions/favorites.actions";
import { getServerSessionSafe } from "@/lib/auth";
import { FavoriteButton } from "@/components/FavoriteButton";
import { RecipeDetailClient } from "./RecipeDetailClient";

const difficultyStyles: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HARD: "bg-rose-500/10 text-rose-600 border-rose-500/20",
};

interface IngredientWithDetails {
  ingredientId: string;
  quantity: number;
  unit: string;
  canonicalName: string;
}

interface RecipeData {
  _id: string;
  name: string;
  cuisineType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  utensils: string[];
  steps: IRecipeStep[];
  ingredients: IngredientWithDetails[];
  nutrition: INutrition;
  imageUrl?: string;
}

async function getRecipe(id: string): Promise<RecipeData | null> {
  await dbConnect();

  const recipe = (await Recipe.findById(
    id,
  ).lean()) as unknown as IRecipe | null;
  if (!recipe) {
    return null;
  }

  const ingredientsWithDetails: IngredientWithDetails[] = [];
  for (const ing of recipe.ingredients) {
    const ingredient = (await Ingredient.findById(
      ing.ingredientId,
    ).lean()) as unknown as IIngredient | null;
    ingredientsWithDetails.push({
      ingredientId: ing.ingredientId.toString(),
      quantity: ing.quantity,
      unit: ing.unit,
      canonicalName: ingredient?.canonicalName ?? "Unknown",
    });
  }

  return {
    _id: recipe._id.toString(),
    name: recipe.name,
    cuisineType: recipe.cuisineType,
    difficulty: recipe.difficulty,
    prepTimeMinutes: recipe.prepTimeMinutes,
    cookTimeMinutes: recipe.cookTimeMinutes,
    servings: recipe.servings,
    utensils: recipe.utensils,
    steps: recipe.steps.map((s) => ({
      stepNumber: s.stepNumber,
      instruction: s.instruction,
    })),
    ingredients: ingredientsWithDetails,
    nutrition: {
      caloriesPerServing: recipe.nutrition.caloriesPerServing,
      proteinGrams: recipe.nutrition.proteinGrams,
      carbsGrams: recipe.nutrition.carbsGrams,
      fatGrams: recipe.nutrition.fatGrams,
    },
    imageUrl: recipe.imageUrl,
  };
}


async function SubstitutionPanelWrapper({
  ingredients,
  availableIngredientIds,
}: {
  ingredients: IngredientWithDetails[];
  availableIngredientIds: string[];
}) {
  return (
    <SubstitutionPanel
      recipeIngredients={ingredients}
      userAvailableIngredientIds={availableIngredientIds}
    />
  );
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await getRecipe(id);

  if (!recipe) {
    notFound();
  }

  const session = await getServerSessionSafe();
  const initialIsFavorite = session?.user?.id
    ? await checkIsFavorite(session.user.id, id)
    : false;

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const availableIngredientIds: string[] = [];

  return (
    <div className="min-h-screen bg-background/50 pb-20">
      <Suspense fallback={<RecipeDetailSkeleton />}>
        {/* Cinematic Hero */}
        <div className="mx-auto w-full max-w-7xl px-0 sm:px-6 lg:px-6">
          <div className="relative w-full overflow-hidden aspect-video">
            {recipe.imageUrl ? (
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <ChefHat className="h-20 w-20 text-muted-foreground/20" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent" />

            <div className="absolute top-6 right-6 md:top-8 md:right-8 lg:top-12 lg:right-12 z-20">
              <FavoriteButton
                recipeId={id}
                initialIsFavorite={initialIsFavorite}
                className="h-12 w-12 shadow-2xl"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 px-4 py-4 sm:px-0 sm:py-8 md:py-10 lg:py-14">
              <div className="w-full">
                <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-4">
                  <Badge
                    className={cn(
                      "px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest backdrop-blur-md border",
                      difficultyStyles[recipe.difficulty],
                    )}
                  >
                    {recipe.difficulty}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="px-2.5 py-0.5 text-[10px] sm:text-[11px] font-black uppercase tracking-widest glass"
                  >
                    <Globe className="h-3 w-3 mr-1" />
                    {recipe.cuisineType}
                  </Badge>
                </div>
                <h1 className="text-2xl sm:text-4xl md:text-6xl font-black font-outfit tracking-tighter mb-2 sm:mb-4 max-w-4xl leading-tight">
                  {recipe.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm font-bold text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>{totalTime} min</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>{recipe.servings} servings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    <span>{recipe.nutrition.caloriesPerServing} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 mt-6 sm:-mt-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left Column: Core Info */}
            <div className="lg:col-span-2 space-y-12">
            <RecipeDetailClient
              recipe={recipe}
              substitutionPanel={
                <Suspense fallback={<div className="h-40 animate-pulse bg-muted/20 rounded-2xl" />}>
                  <SubstitutionPanelWrapper
                    ingredients={recipe.ingredients}
                    availableIngredientIds={availableIngredientIds}
                  />
                </Suspense>
              }
            />
            </div>

            {/* Right Column: Meta & Dashboard */}
            <div className="space-y-8">
              {recipe.utensils.length > 0 && (
                <GlassCard className="p-8" variant="vibrant">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <UtensilsCrossed className="h-5 w-5" />
                    </div>
                    <h3 className="font-black font-outfit tracking-tight">
                      Tools needed
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.utensils.map((utensil: string, index: number) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="rounded-xl px-3 py-1 bg-background/50 border-border/50 text-xs font-bold"
                      >
                        {utensil}
                      </Badge>
                    ))}
                  </div>
                </GlassCard>
              )}

              <GlassCard className="p-8 group">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="h-5 w-5 text-primary" />
                  <h3 className="font-black font-outfit tracking-tight">
                    Recipe Details
                  </h3>
                </div>
                <div className="space-y-4">
                  {[
                    {
                      label: "Preparation",
                      value: `${recipe.prepTimeMinutes}m`,
                    },
                    { label: "Cooking", value: `${recipe.cookTimeMinutes}m` },
                    { label: "Course", value: recipe.cuisineType },
                    { label: "Difficulty", value: recipe.difficulty },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      className="flex justify-between items-center py-2 border-b border-border/30 last:border-0"
                    >
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                        {stat.label}
                      </span>
                      <span className="text-sm font-black font-outfit">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}

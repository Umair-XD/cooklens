import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChefHat, UtensilsCrossed } from "lucide-react";
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
import {
  NutritionPanel,
  type NutritionInfo,
} from "@/components/NutritionPanel";
import { SubstitutionPanel } from "@/components/SubstitutionPanel";
import { RecipeDetailSkeleton } from "@/components/RecipeDetailSkeleton";
import { Types } from "mongoose";

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  HARD: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

interface IngredientWithDetails {
  ingredientId: Types.ObjectId;
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
}

async function getRecipe(id: string): Promise<RecipeData | null> {
  await dbConnect();

  const recipe = (await Recipe.findById(
    id,
  ).lean()) as unknown as IRecipe | null;
  if (!recipe) {
    return null;
  }

  // Populate ingredient details
  const ingredientsWithDetails: IngredientWithDetails[] = [];
  for (const ing of recipe.ingredients) {
    const ingredient = (await Ingredient.findById(
      ing.ingredientId,
    ).lean()) as unknown as IIngredient | null;
    ingredientsWithDetails.push({
      ingredientId: ing.ingredientId,
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
    steps: recipe.steps,
    ingredients: ingredientsWithDetails,
    nutrition: recipe.nutrition,
  };
}

function IngredientsTab({
  ingredients,
}: {
  ingredients: IngredientWithDetails[];
}) {
  if (ingredients.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No ingredients listed.</p>
    );
  }

  return (
    <ul className="space-y-2">
      {ingredients.map((ing, index) => (
        <li
          key={index}
          className="flex items-center justify-between rounded-md border p-3 text-sm"
        >
          <span className="font-medium">{ing.canonicalName}</span>
          <span className="text-muted-foreground">
            {ing.quantity} {ing.unit}
          </span>
        </li>
      ))}
    </ul>
  );
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

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;

  // TODO: Replace with actual user's available ingredient IDs from session/pantry
  // For now, pass an empty list so all ingredients are treated as missing
  const availableIngredientIds: string[] = [];

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Suspense fallback={<RecipeDetailSkeleton />}>
        {/* Hero image area */}
        <div className="w-full aspect-video bg-muted rounded-lg mb-6 flex items-center justify-center">
          <ChefHat className="h-16 w-16 text-muted-foreground" />
        </div>

        {/* Title and meta */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{recipe.name}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <Badge
              variant="secondary"
              className={difficultyColors[recipe.difficulty]}
            >
              {recipe.difficulty.charAt(0) +
                recipe.difficulty.slice(1).toLowerCase()}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {recipe.cuisineType}
            </span>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Prep: {recipe.prepTimeMinutes}m</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Cook: {recipe.cookTimeMinutes}m</span>
            </div>
            <span className="text-sm text-muted-foreground">
              ({totalTime}m total)
            </span>
            <span className="text-sm text-muted-foreground">
              Servings: {recipe.servings}
            </span>
          </div>
        </div>

        {/* Utensils */}
        {recipe.utensils.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <UtensilsCrossed className="h-4 w-4" />
                Utensils
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {recipe.utensils.map((utensil: string, index: number) => (
                  <Badge key={index} variant="outline">
                    {utensil}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator className="mb-6" />

        {/* Tabs: Ingredients / Steps / Nutrition */}
        <Tabs defaultValue="ingredients">
          <TabsList className="mb-4">
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="steps">Steps</TabsTrigger>
            <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
            <TabsTrigger value="substitutions">Substitutions</TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <IngredientsTab ingredients={recipe.ingredients} />
          </TabsContent>

          <TabsContent value="steps">
            <StepList steps={recipe.steps} />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionPanel
              nutrition={{
                caloriesPerServing: recipe.nutrition.caloriesPerServing,
                proteinGrams: recipe.nutrition.proteinGrams,
                carbsGrams: recipe.nutrition.carbsGrams,
                fatGrams: recipe.nutrition.fatGrams,
              }}
              baseServings={recipe.servings}
            />
          </TabsContent>

          <TabsContent value="substitutions">
            <SubstitutionPanelWrapper
              ingredients={recipe.ingredients}
              availableIngredientIds={availableIngredientIds}
            />
          </TabsContent>
        </Tabs>
      </Suspense>
    </div>
  );
}

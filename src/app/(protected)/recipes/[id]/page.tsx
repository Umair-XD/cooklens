import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, ChefHat, UtensilsCrossed, Globe, Flame, Users, ScrollText, CheckCircle2, Info, Activity } from "lucide-react";
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
} from "@/components/NutritionPanel";
import { SubstitutionPanel } from "@/components/SubstitutionPanel";
import { RecipeDetailSkeleton } from "@/components/RecipeDetailSkeleton";
import { Types } from "mongoose";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils";
import { toggleFavorite, isFavorite as checkIsFavorite } from "@/lib/actions/favorites.actions";
import { getServerSessionSafe } from "@/lib/auth";
import { FavoriteButton } from "@/components/FavoriteButton";

const difficultyStyles: Record<string, string> = {
  EASY: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  MEDIUM: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  HARD: "bg-rose-500/10 text-rose-600 border-rose-500/20",
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
    imageUrl: recipe.imageUrl,
  };
}

function IngredientsTab({
  ingredients,
}: {
  ingredients: IngredientWithDetails[];
}) {
  if (ingredients.length === 0) {
    return (
      <div className="flex flex-col items-center py-10 text-muted-foreground bg-muted/20 rounded-2xl border border-dashed border-border/60">
        <p className="text-sm font-bold">No ingredients identified.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {ingredients.map((ing, index) => (
        <div
          key={index}
          className="flex items-center justify-between rounded-2xl border border-border/50 p-4 bg-card/40 glass group hover:border-primary/30 transition-all"
        >
          <div className="flex items-center gap-3">
             <div className="h-2 w-2 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
             <span className="font-bold text-sm tracking-tight">{ing.canonicalName}</span>
          </div>
          <Badge variant="secondary" className="rounded-lg bg-primary/5 text-primary border-primary/10">
            {ing.quantity} {ing.unit}
          </Badge>
        </div>
      ))}
    </div>
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

  const session = await getServerSessionSafe();
  const initialIsFavorite = session?.user?.id ? await checkIsFavorite(session.user.id, id) : false;

  const totalTime = recipe.prepTimeMinutes + recipe.cookTimeMinutes;
  const availableIngredientIds: string[] = [];

  return (
    <div className="min-h-screen bg-background/50 pb-20">
      <Suspense fallback={<RecipeDetailSkeleton />}>
        {/* Cinematic Hero */}
        <div className="relative w-full aspect-[21/9] md:aspect-[25/9] overflow-hidden">
          {recipe.imageUrl ? (
             <img src={recipe.imageUrl} alt={recipe.name} className="w-full h-full object-cover" />
          ) : (
             <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <ChefHat className="h-20 w-20 text-muted-foreground/20" />
             </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          
          <div className="absolute top-6 right-6 md:top-12 md:right-12 lg:right-20 z-20">
             <FavoriteButton recipeId={id} initialIsFavorite={initialIsFavorite} className="h-12 w-12 shadow-2xl" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-20">
             <div className="mx-auto max-w-7xl">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                   <Badge className={cn("px-3 py-1 text-[11px] font-black uppercase tracking-widest backdrop-blur-md border", difficultyStyles[recipe.difficulty])}>
                      {recipe.difficulty}
                   </Badge>
                   <Badge variant="secondary" className="px-3 py-1 text-[11px] font-black uppercase tracking-widest glass">
                     <Globe className="h-3 w-3 mr-1.5" />
                     {recipe.cuisineType}
                   </Badge>
                </div>
                <h1 className="text-4xl md:text-6xl font-black font-outfit tracking-tighter mb-4 max-w-4xl">{recipe.name}</h1>
                <div className="flex flex-wrap items-center gap-8 text-sm font-bold text-muted-foreground">
                   <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{totalTime} Minutes</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{recipe.servings} Servings</span>
                   </div>
                   <div className="flex items-center gap-2">
                      <Flame className="h-4 w-4 text-primary" />
                      <span>{recipe.nutrition.caloriesPerServing} kcal</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 -mt-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
             {/* Left Column: Core Info */}
             <div className="lg:col-span-2 space-y-12">
                <GlassCard className="p-1 overflow-hidden" hover={false}>
                  <Tabs defaultValue="ingredients" className="w-full">
                    <TabsList className="w-full justify-start rounded-none bg-muted/20 p-1 h-14 border-b border-border/50">
                      <TabsTrigger value="ingredients" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <UtensilsCrossed className="h-4 w-4 mr-2" />
                        Ingredients
                      </TabsTrigger>
                      <TabsTrigger value="steps" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <ScrollText className="h-4 w-4 mr-2" />
                        Cooking Steps
                      </TabsTrigger>
                      <TabsTrigger value="nutrition" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <Activity className="h-4 w-4 mr-2" />
                        Nutrition
                      </TabsTrigger>
                      <TabsTrigger value="substitutions" className="rounded-xl px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Swaps
                      </TabsTrigger>
                    </TabsList>

                    <div className="p-8">
                       <TabsContent value="ingredients" className="mt-0 outline-none">
                         <div className="mb-8">
                           <h2 className="text-xl font-black font-outfit tracking-tight mb-2">What you'll need</h2>
                           <p className="text-sm text-muted-foreground font-medium">Click on ingredients to see available substitutions if you're missing something.</p>
                         </div>
                         <IngredientsTab ingredients={recipe.ingredients} />
                       </TabsContent>

                       <TabsContent value="steps" className="mt-0 outline-none">
                         <div className="mb-8">
                           <h2 className="text-xl font-black font-outfit tracking-tight mb-2">How to cook it</h2>
                           <p className="text-sm text-muted-foreground font-medium">Follow these steps for a perfect result every time.</p>
                         </div>
                         <StepList steps={recipe.steps} />
                       </TabsContent>

                       <TabsContent value="nutrition" className="mt-0 outline-none">
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

                       <TabsContent value="substitutions" className="mt-0 outline-none">
                          <SubstitutionPanelWrapper
                            ingredients={recipe.ingredients}
                            availableIngredientIds={availableIngredientIds}
                          />
                       </TabsContent>
                    </div>
                  </Tabs>
                </GlassCard>
             </div>

             {/* Right Column: Meta & Dashboard */}
             <div className="space-y-8">
                {recipe.utensils.length > 0 && (
                   <GlassCard className="p-8" variant="vibrant">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                           <UtensilsCrossed className="h-5 w-5" />
                        </div>
                        <h3 className="font-black font-outfit tracking-tight">Tools needed</h3>
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
                      <h3 className="font-black font-outfit tracking-tight">Recipe Details</h3>
                   </div>
                   <div className="space-y-4">
                      {[
                        { label: "Preparation", value: `${recipe.prepTimeMinutes}m` },
                        { label: "Cooking", value: `${recipe.cookTimeMinutes}m` },
                        { label: "Course", value: recipe.cuisineType },
                        { label: "Difficulty", value: recipe.difficulty }
                      ].map((stat) => (
                         <div key={stat.label} className="flex justify-between items-center py-2 border-b border-border/30 last:border-0">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                            <span className="text-sm font-black font-outfit">{stat.value}</span>
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

import { RecipeManager } from "@/components/RecipeManager";
import { getAllRecipes, getAllIngredients } from "@/lib/actions/admin.actions";

export const dynamic = "force-dynamic";

export default async function AdminRecipesPage() {
  const recipes = await getAllRecipes();
  const ingredients = await getAllIngredients();

  const recipeData = recipes.map((r) => ({
    _id: r._id.toString(),
    name: r.name,
    cuisineType: r.cuisineType,
    difficulty: r.difficulty,
    prepTimeMinutes: r.prepTimeMinutes,
    cookTimeMinutes: r.cookTimeMinutes,
    servings: r.servings,
  }));

  const ingredientOptions = ingredients.map((i) => ({
    _id: i._id.toString(),
    canonicalName: i.canonicalName,
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Recipe Management
      </h2>
      <RecipeManager
        recipes={recipeData}
        ingredientOptions={ingredientOptions}
        onRefresh={() => {}}
      />
    </div>
  );
}

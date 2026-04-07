import { IngredientManager } from "@/components/IngredientManager";
import { getAllIngredients } from "@/lib/actions/admin.actions";

export const dynamic = "force-dynamic";

export default async function AdminIngredientsPage() {
  const ingredients = await getAllIngredients();

  const ingredientData = ingredients.map((i) => ({
    _id: i._id.toString(),
    canonicalName: i.canonicalName,
    aliases: i.aliases || [],
  }));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold tracking-tight">
        Ingredient Management
      </h2>
      <IngredientManager ingredients={ingredientData} onRefresh={() => {}} />
    </div>
  );
}

import { dbConnect } from "@/lib/db/connect";
import {
  IngredientSubstitution,
  type IIngredientSubstitution,
} from "@/lib/db/models/IngredientSubstitution";
import { Ingredient, type IIngredient } from "@/lib/db/models/Ingredient";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Types } from "mongoose";

export interface RecipeIngredient {
  ingredientId: Types.ObjectId | string;
  quantity: number;
  unit: string;
}

interface SubstitutionPanelProps {
  recipeIngredients: RecipeIngredient[];
  userAvailableIngredientIds: string[];
}

interface SubstitutionOption {
  toIngredientName: string;
  impactNote: string;
}

async function getSubstitutions(
  ingredientIds: (Types.ObjectId | string)[],
  userAvailableIds: string[],
): Promise<Map<string, SubstitutionOption[]>> {
  await dbConnect();

  const substitutionsMap = new Map<string, SubstitutionOption[]>();

  for (const ingredientId of ingredientIds) {
    const idStr = ingredientId.toString();

    // Skip if the user already has this ingredient
    if (userAvailableIds.includes(idStr)) {
      continue;
    }

    const substitutions = (await IngredientSubstitution.find({
      fromIngredientId: new Types.ObjectId(idStr),
    }).lean()) as unknown as IIngredientSubstitution[];

    const options: SubstitutionOption[] = [];

    for (const sub of substitutions) {
      const toIngredient = (await Ingredient.findById(
        sub.toIngredientId,
      ).lean()) as unknown as IIngredient | null;
      options.push({
        toIngredientName: toIngredient?.canonicalName ?? "Unknown ingredient",
        impactNote: sub.impactNote,
      });
    }

    if (options.length > 0) {
      substitutionsMap.set(idStr, options);
    }
  }

  return substitutionsMap;
}

async function getIngredientNames(
  ingredientIds: (Types.ObjectId | string)[],
): Promise<Map<string, string>> {
  await dbConnect();

  const namesMap = new Map<string, string>();

  for (const ingredientId of ingredientIds) {
    const ingredient = (await Ingredient.findById(
      new Types.ObjectId(ingredientId.toString()),
    ).lean()) as unknown as IIngredient | null;
    namesMap.set(
      ingredientId.toString(),
      ingredient?.canonicalName ?? "Unknown ingredient",
    );
  }

  return namesMap;
}

export async function SubstitutionPanel({
  recipeIngredients,
  userAvailableIngredientIds,
}: SubstitutionPanelProps) {
  const ingredientIds = recipeIngredients.map((ing) => ing.ingredientId);

  const [substitutionsMap, ingredientNames] = await Promise.all([
    getSubstitutions(ingredientIds, userAvailableIngredientIds),
    getIngredientNames(ingredientIds),
  ]);

  // Determine which ingredients need substitution
  const ingredientsNeedingSubstitution = recipeIngredients.filter(
    (ing) => !userAvailableIngredientIds.includes(ing.ingredientId.toString()),
  );

  if (ingredientsNeedingSubstitution.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>
          You have all the ingredients for this recipe. No substitutions needed!
        </p>
      </div>
    );
  }

  if (substitutionsMap.size === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No substitutions available for the missing ingredients.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Accordion type="multiple" className="w-full">
        {ingredientsNeedingSubstitution.map((ingredient) => {
          const idStr = ingredient.ingredientId.toString();
          const ingredientName =
            ingredientNames.get(idStr) ?? "Unknown ingredient";
          const substitutions = substitutionsMap.get(idStr);

          if (!substitutions || substitutions.length === 0) {
            return (
              <div key={idStr} className="py-3 border-b last:border-b-0">
                <p className="text-sm font-medium">{ingredientName}</p>
                <p className="text-sm text-muted-foreground">
                  No substitution available
                </p>
              </div>
            );
          }

          return (
            <AccordionItem key={idStr} value={idStr}>
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <span>{ingredientName}</span>
                  <Badge variant="secondary" className="text-xs">
                    {substitutions.length} alternative
                    {substitutions.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3">
                  {substitutions.map((sub, index) => (
                    <li key={index} className="rounded-md border p-3 text-sm">
                      <p className="font-medium">{sub.toIngredientName}</p>
                      <p className="text-muted-foreground mt-1">
                        {sub.impactNote}
                      </p>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

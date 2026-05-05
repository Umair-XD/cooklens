"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash2 } from "lucide-react";
import { ImageUploader } from "@/components/ImageUploader";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createRecipe,
  updateRecipe,
  type RecipeFormValues,
} from "@/lib/actions/admin.actions";

const recipeFormSchema = z.object({
  name: z.string().min(1, "Recipe name is required"),
  cuisineType: z.string().min(1, "Cuisine type is required"),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  prepTimeMinutes: z.coerce.number().min(0, "Must be 0 or greater"),
  cookTimeMinutes: z.coerce.number().min(0, "Must be 0 or greater"),
  servings: z.coerce.number().min(1, "Must be at least 1"),
  utensils: z.string().min(1, "At least one utensil is required"),
  imageUrl: z.string().optional(),
  steps: z
    .array(
      z.object({
        stepNumber: z.number(),
        instruction: z.string().min(1, "Step instruction is required"),
      }),
    )
    .min(1, "At least one step is required"),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string().min(1, "Ingredient is required"),
        quantity: z.coerce.number().min(0, "Must be 0 or greater"),
        unit: z.string().min(1, "Unit is required"),
      }),
    )
    .min(1, "At least one ingredient is required"),
  nutrition: z.object({
    caloriesPerServing: z.coerce.number().min(0, "Must be 0 or greater"),
    proteinGrams: z.coerce.number().min(0, "Must be 0 or greater"),
    carbsGrams: z.coerce.number().min(0, "Must be 0 or greater"),
    fatGrams: z.coerce.number().min(0, "Must be 0 or greater"),
  }),
});

export type RecipeFormSchema = z.infer<typeof recipeFormSchema>;

export interface RecipeFormProps {
  recipe?: RecipeFormSchema & { _id?: string; imageUrl?: string };
  ingredientOptions: { _id: string; canonicalName: string }[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultValues: RecipeFormSchema = {
  name: "",
  cuisineType: "",
  difficulty: "EASY",
  prepTimeMinutes: 0,
  cookTimeMinutes: 0,
  servings: 1,
  utensils: "",
  imageUrl: "",
  steps: [{ stepNumber: 1, instruction: "" }],
  ingredients: [{ ingredientId: "", quantity: 0, unit: "" }],
  nutrition: {
    caloriesPerServing: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
  },
};

export function RecipeForm({
  recipe,
  ingredientOptions,
  onSuccess,
  onCancel,
}: RecipeFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Build a fully-populated initial value so every input starts controlled.
  // If recipe is provided it may be a partial RecipeRecord (no ingredients /
  // steps / nutrition), so we merge with defaultValues to fill gaps.
  const mergedDefaults: RecipeFormSchema = recipe
    ? {
        ...defaultValues,
        ...recipe,
        utensils: Array.isArray((recipe as any).utensils)
          ? (recipe as any).utensils.join(", ")
          : (recipe as any).utensils ?? "",
        ingredients: (recipe as any).ingredients?.length
          ? (recipe as any).ingredients
          : defaultValues.ingredients,
        steps: (recipe as any).steps?.length
          ? (recipe as any).steps
          : defaultValues.steps,
        nutrition: (recipe as any).nutrition ?? defaultValues.nutrition,
        imageUrl: (recipe as any).imageUrl ?? "",
      }
    : defaultValues;

  const form = useForm<RecipeFormSchema>({
    resolver: zodResolver(recipeFormSchema),
    defaultValues: mergedDefaults,
  });

  // Re-sync if the recipe prop changes (e.g. switching edited record).
  useEffect(() => {
    if (recipe) {
      form.reset(mergedDefaults);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recipe?._id]);

  const addStep = () => {
    const steps = form.getValues("steps");
    form.setValue("steps", [
      ...steps,
      { stepNumber: steps.length + 1, instruction: "" },
    ]);
  };

  const removeStep = (index: number) => {
    const steps = form.getValues("steps");
    if (steps.length <= 1) return;
    form.setValue(
      "steps",
      steps
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, stepNumber: i + 1 })),
    );
  };

  const addIngredient = () => {
    const ingredients = form.getValues("ingredients");
    form.setValue("ingredients", [
      ...ingredients,
      { ingredientId: "", quantity: 0, unit: "" },
    ]);
  };

  const removeIngredient = (index: number) => {
    const ingredients = form.getValues("ingredients");
    if (ingredients.length <= 1) return;
    form.setValue(
      "ingredients",
      ingredients.filter((_, i) => i !== index),
    );
  };

  const onSubmit = async (values: RecipeFormSchema) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: RecipeFormValues = {
        name: values.name,
        cuisineType: values.cuisineType,
        difficulty: values.difficulty,
        prepTimeMinutes: Number(values.prepTimeMinutes),
        cookTimeMinutes: Number(values.cookTimeMinutes),
        servings: Number(values.servings),
        utensils: values.utensils
          .split(",")
          .map((u) => u.trim())
          .filter(Boolean),
        steps: values.steps.map((s, i) => ({
          stepNumber: i + 1,
          instruction: s.instruction,
        })),
        ingredients: values.ingredients.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: Number(i.quantity),
          unit: i.unit,
        })),
        nutrition: {
          caloriesPerServing: Number(values.nutrition.caloriesPerServing),
          proteinGrams: Number(values.nutrition.proteinGrams),
          carbsGrams: Number(values.nutrition.carbsGrams),
          fatGrams: Number(values.nutrition.fatGrams),
        },
        imageUrl: values.imageUrl || undefined,
      };

      const result = recipe?._id
        ? await updateRecipe(recipe._id, payload)
        : await createRecipe(payload);

      if (!result.success) {
        const errs = (
          result as { errors?: { field: string; message: string }[] }
        )?.errors;
        if (errs && errs.length > 0) {
          errs.forEach((e) => {
            form.setError(e.field as keyof RecipeFormSchema, {
              message: e.message,
            });
          });
          setError(errs.map((e) => e.message).join(", "));
        } else {
          setError("Operation failed");
        }
        return;
      }

      form.reset(defaultValues);
      onSuccess?.();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Cover Image */}
        <div>
          <Label className="mb-2 block">Cover Image</Label>
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ImageUploader
                    variant="cover"
                    folder="cooklens/recipes"
                    value={field.value || ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Basic info */}
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Recipe Name</FormLabel>
                <FormControl>
                  <Input placeholder="Chicken Tikka Masala" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cuisineType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine Type</FormLabel>
                <FormControl>
                  <Input placeholder="Indian" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <FormField
            control={form.control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="z-[200]">
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prepTimeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prep Time (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cookTimeMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="servings"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servings</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Utensils */}
        <FormField
          control={form.control}
          name="utensils"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Utensils (comma-separated)</FormLabel>
              <FormControl>
                <Input placeholder="Pan, Spatula, Oven" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Ingredients */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Ingredients</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addIngredient}
            >
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {(form.watch("ingredients") || []).map((_, index) => (
            <div key={index} className="flex gap-2 items-start mb-2">
              <FormField
                control={form.control}
                name={`ingredients.${index}.ingredientId`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select ingredient" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="z-[200]">
                        {ingredientOptions.map((ing) => (
                          <SelectItem key={ing._id} value={ing._id}>
                            {ing.canonicalName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`ingredients.${index}.quantity`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        step="any"
                        placeholder="Qty"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`ingredients.${index}.unit`}
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormControl>
                      <Input placeholder="Unit" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeIngredient(index)}
                disabled={(form.watch("ingredients") || []).length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Steps */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Steps</Label>
            <Button type="button" variant="outline" size="sm" onClick={addStep}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>
          {(form.watch("steps") || []).map((_, index) => (
            <div key={index} className="flex gap-2 items-start mb-2">
              <span className="pt-2 text-sm text-muted-foreground w-8 text-right">
                {index + 1}.
              </span>
              <FormField
                control={form.control}
                name={`steps.${index}.instruction`}
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Textarea
                        placeholder="Describe this step..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeStep(index)}
                disabled={(form.watch("steps") || []).length <= 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        {/* Nutrition */}
        <div>
          <Label className="mb-2 block">Nutrition (per serving)</Label>
          <div className="grid gap-4 sm:grid-cols-4">
            <FormField
              control={form.control}
              name="nutrition.caloriesPerServing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calories</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutrition.proteinGrams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Protein (g)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutrition.carbsGrams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Carbs (g)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nutrition.fatGrams"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fat (g)</FormLabel>
                  <FormControl>
                    <Input type="number" min={0} step="any" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : recipe
                ? "Update Recipe"
                : "Create Recipe"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

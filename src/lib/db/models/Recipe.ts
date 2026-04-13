import { Schema, model, models, Document, Types } from 'mongoose';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface IRecipeIngredient {
  ingredientId: Types.ObjectId;
  quantity: number;
  unit: string;
}

export interface IRecipeStep {
  stepNumber: number;
  instruction: string;
}

export interface INutrition {
  caloriesPerServing: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface IRecipe extends Document {
  imageUrl: string | undefined;
  name: string;
  cuisineType: string;
  difficulty: Difficulty;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  utensils: string[];
  steps: IRecipeStep[];
  ingredients: IRecipeIngredient[];
  nutrition: INutrition;
  createdAt: Date;
  updatedAt: Date;
}

const RecipeSchema = new Schema<IRecipe>(
  {
    name: { type: String, required: true },
    cuisineType: { type: String, required: true },
    difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], required: true },
    prepTimeMinutes: { type: Number, required: true, min: 0 },
    cookTimeMinutes: { type: Number, required: true, min: 0 },
    servings: { type: Number, required: true, min: 1 },
    utensils: { type: [String], required: true },
    steps: [
      {
        stepNumber: { type: Number, required: true },
        instruction: { type: String, required: true },
      },
    ],
    ingredients: [
      {
        ingredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
      },
    ],
    nutrition: {
      caloriesPerServing: { type: Number, required: true },
      proteinGrams: { type: Number, required: true },
      carbsGrams: { type: Number, required: true },
      fatGrams: { type: Number, required: true },
    },
  },
  { timestamps: true }
);

RecipeSchema.index({ name: 'text', cuisineType: 'text' });

export const Recipe = models.Recipe ?? model<IRecipe>('Recipe', RecipeSchema);

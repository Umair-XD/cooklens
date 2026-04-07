import { Schema, model, models, Document } from 'mongoose';

export interface IIngredient extends Document {
  canonicalName: string;
  aliases: string[];
}

const IngredientSchema = new Schema<IIngredient>({
  canonicalName: { type: String, required: true, unique: true },
  aliases: [String],
});

IngredientSchema.index({ canonicalName: 'text', aliases: 'text' });

export const Ingredient = models.Ingredient ?? model<IIngredient>('Ingredient', IngredientSchema);

import { Schema, model, models, Document, Types } from 'mongoose';

export interface IIngredientSubstitution extends Document {
  fromIngredientId: Types.ObjectId;
  toIngredientId: Types.ObjectId;
  impactNote: string;
}

const SubstitutionSchema = new Schema<IIngredientSubstitution>({
  fromIngredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  toIngredientId: { type: Schema.Types.ObjectId, ref: 'Ingredient', required: true },
  impactNote: { type: String, required: true },
});

export const IngredientSubstitution =
  models.IngredientSubstitution ??
  model<IIngredientSubstitution>('IngredientSubstitution', SubstitutionSchema);

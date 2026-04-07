import { Schema, model, models, Document, Types } from 'mongoose';

export type MealType = 'BREAKFAST' | 'LUNCH' | 'DINNER';

export interface IMealSlot {
  dayIndex: number; // 0–6
  mealType: MealType;
  recipeId: Types.ObjectId;
}

export interface IMealPlan extends Document {
  userId: Types.ObjectId;
  weekStart: Date;
  slots: IMealSlot[];
  createdAt: Date;
}

const MealPlanSchema = new Schema<IMealPlan>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekStart: { type: Date, required: true },
    slots: [
      {
        dayIndex: { type: Number, required: true, min: 0, max: 6 },
        mealType: {
          type: String,
          enum: ['BREAKFAST', 'LUNCH', 'DINNER'],
          required: true,
        },
        recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
      },
    ],
  },
  { timestamps: true }
);

export const MealPlan = models.MealPlan ?? model<IMealPlan>('MealPlan', MealPlanSchema);

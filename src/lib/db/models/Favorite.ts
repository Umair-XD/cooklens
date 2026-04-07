import { Schema, model, models, Document, Types } from 'mongoose';

export interface IFavorite extends Document {
  userId: Types.ObjectId;
  recipeId: Types.ObjectId;
  createdAt: Date;
}

const FavoriteSchema = new Schema<IFavorite>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recipeId: { type: Schema.Types.ObjectId, ref: 'Recipe', required: true },
  },
  { timestamps: true }
);

FavoriteSchema.index({ userId: 1, recipeId: 1 }, { unique: true });

export const Favorite = models.Favorite ?? model<IFavorite>('Favorite', FavoriteSchema);

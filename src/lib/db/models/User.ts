import { Schema, model, models, Document } from 'mongoose';

export type Role = 'USER' | 'ADMIN';

export interface IUser extends Document {
  email: string;
  passwordHash?: string;
  displayName?: string;
  photoUrl?: string;
  role: Role;
  preferences?: {
    cuisineTypes: string[];
    dietaryRestrictions: string[];
    dislikedIngredients: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: String,
    displayName: String,
    photoUrl: String,
    role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
    preferences: {
      cuisineTypes: [String],
      dietaryRestrictions: [String],
      dislikedIngredients: [String],
    },
  },
  { timestamps: true }
);

export const User = models.User ?? model<IUser>('User', UserSchema);

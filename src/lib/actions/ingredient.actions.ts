'use server';

import { dbConnect } from '@/lib/db/connect';
import { Ingredient } from '@/lib/db/models/Ingredient';

export async function normalizeIngredient(
  raw: string
): Promise<{ success: boolean; canonicalName?: string; error?: string }> {
  const trimmed = raw.trim();

  if (!trimmed) {
    return { success: false, error: 'Ingredient name is required' };
  }

  try {
    await dbConnect();

    const regex = new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');

    const ingredient = await Ingredient.findOne({
      $or: [
        { canonicalName: regex },
        { aliases: regex },
      ],
    }).select('canonicalName');

    if (!ingredient) {
      return { success: false, error: 'Ingredient not found' };
    }

    return { success: true, canonicalName: ingredient.canonicalName };
  } catch (error) {
    console.error('Normalize ingredient error:', error);
    return { success: false, error: 'Failed to normalize ingredient' };
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { dbConnect } from '@/lib/db/connect';
import { Ingredient } from '@/lib/db/models/Ingredient';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get('q');

  if (!q || q.trim().length === 0) {
    return NextResponse.json([]);
  }

  try {
    await dbConnect();

    const trimmed = q.trim();
    const regex = new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

    const ingredients = await Ingredient.find({
      $or: [
        { canonicalName: regex },
        { aliases: regex },
      ],
    })
      .select('canonicalName aliases')
      .limit(10)
      .lean();

    const results = ingredients.map((ing) => ({
      id: (ing._id as string).toString(),
      canonicalName: ing.canonicalName,
      aliases: ing.aliases || [],
    }));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Ingredient search error:', error);
    return NextResponse.json(
      { error: 'Failed to search ingredients' },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSessionSafe } from "@/lib/auth";
import { dbConnect } from "@/lib/db/connect";
import { Favorite } from "@/lib/db/models/Favorite";
import { Types } from "mongoose";

export async function GET() {
  try {
    const session = await getServerSessionSafe();
    if (!session?.user?.id) {
      return NextResponse.json({ favoriteIds: [] });
    }

    await dbConnect();
    const favorites = await Favorite.find({
      userId: new Types.ObjectId(session.user.id),
    }).select("recipeId");

    const favoriteIds = favorites.map((f) => f.recipeId.toString());

    return NextResponse.json({ favoriteIds });
  } catch (error) {
    console.error("Get favorite ids error:", error);
    return NextResponse.json({ favoriteIds: [] }, { status: 500 });
  }
}

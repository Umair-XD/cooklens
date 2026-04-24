import { NextRequest, NextResponse } from "next/server";
import { getServerSessionSafe } from "@/lib/auth";
import { dbConnect } from "@/lib/db/connect";
import { MealPlan } from "@/lib/db/models/MealPlan";
import { Types } from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ planId: string }> }
) {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planId } = await params;

  try {
    await dbConnect();

    const plan = await (MealPlan as any).findOne({
      _id: new Types.ObjectId(planId),
      userId: new Types.ObjectId(session.user.id),
    })
      .populate("slots.recipeId")
      .lean();

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Prepare recipe map for easier access
    const slots = (plan.slots || []) as any[];
    const recipeMap: Record<string, any> = {};
    for (const slot of slots) {
      if (slot.recipeId && typeof slot.recipeId === "object") {
        const id = slot.recipeId._id?.toString() || slot.recipeId.toString();
        recipeMap[id] = slot.recipeId;
      }
    }

    return NextResponse.json({
      plan: JSON.parse(JSON.stringify(plan)),
      recipeMap: JSON.parse(JSON.stringify(recipeMap)),
    });
  } catch (err: any) {
    console.error("Plan data fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch plan data" }, { status: 500 });
  }
}

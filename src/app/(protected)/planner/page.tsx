import { getServerSessionSafe } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlan, generatePlan } from "@/lib/actions/planner.actions";
import { calculateTDEE } from "@/lib/utils/tdee";
import PlannerPageClient from "./PlannerPageClient";
import type { IMealPlan } from "@/lib/db/models/MealPlan";

export default async function PlannerPage() {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Load existing plan if available
  const planResult = await getPlan(userId);
  const initialPlan: IMealPlan | null =
    planResult.success && planResult.plan ? planResult.plan : null;

  return <PlannerPageClient userId={userId} initialPlan={initialPlan} />;
}

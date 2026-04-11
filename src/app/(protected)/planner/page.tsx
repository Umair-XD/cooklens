import { getServerSessionSafe } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPlan } from "@/lib/actions/planner.actions";
import PlannerPageClient from "./PlannerPageClient";

export default async function PlannerPage() {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) redirect("/login");

  const planResult = await getPlan(session.user.id);
  const initialPlan =
    planResult.success && planResult.plan ? planResult.plan : null;

  return (
    <PlannerPageClient userId={session.user.id} initialPlan={initialPlan} />
  );
}

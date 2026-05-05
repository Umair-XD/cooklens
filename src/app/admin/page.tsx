import { dbConnect } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { Ingredient } from "@/lib/db/models/Ingredient";
import { User } from "@/lib/db/models/User";
import { Favorite } from "@/lib/db/models/Favorite";
import { IngredientSubstitution } from "@/lib/db/models/IngredientSubstitution";
import Link from "next/link";
import {
  ChefHat,
  Leaf,
  ArrowRight,
  Users,
  Heart,
  ArrowLeftRight,
  Clock,
} from "lucide-react";
import { UserGrowthChart, HorizontalBarList } from "@/components/AdminCharts";
import { formatDistanceToNow } from "date-fns";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function last7DayLabels(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });
}

function dayLabel(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "short",
  });
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({
  icon: Icon,
  label,
  value,
  href,
  linkLabel,
  color = "text-primary",
  bg = "bg-primary/10",
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  href?: string;
  linkLabel?: string;
  color?: string;
  bg?: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-5">
      <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-center gap-3">
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg} ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 truncate">
            {label}
          </p>
          <h2 className="text-3xl font-black font-outfit leading-none mt-0.5">
            {value.toLocaleString()}
          </h2>
        </div>
      </div>
      {href && linkLabel && (
        <div className="relative mt-4 flex justify-end">
          <Link
            href={href}
            className={`flex items-center gap-1.5 text-xs font-black ${color} opacity-70 hover:opacity-100 transition-opacity`}
          >
            {linkLabel} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground/60">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-muted-foreground/50 mt-0.5">{subtitle}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminDashboardPage() {
  await dbConnect();

  const days = last7DayLabels();
  const sevenDaysAgo = new Date(days[0] + "T00:00:00");

  const [
    userCount,
    recipeCount,
    ingredientCount,
    substitutionCount,
    userGrowthRaw,
    difficultyRaw,
    cuisineRaw,
    topFavoritedRaw,
    recentUsersRaw,
  ] = await Promise.all([
    User.countDocuments(),
    Recipe.countDocuments(),
    Ingredient.countDocuments(),
    IngredientSubstitution.countDocuments(),

    // New users per day (last 7 days)
    User.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
    ]),

    // Recipe difficulty breakdown
    Recipe.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
    ]),

    // Top 6 cuisine types
    Recipe.aggregate([
      { $group: { _id: "$cuisineType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]),

    // Top 5 most favorited recipes
    Favorite.aggregate([
      { $group: { _id: "$recipeId", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "recipes",
          localField: "_id",
          foreignField: "_id",
          as: "recipe",
        },
      },
      { $unwind: "$recipe" },
      { $project: { name: "$recipe.name", cuisineType: "$recipe.cuisineType", count: 1 } },
    ]),

    // 5 most recent users
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("email displayName createdAt")
      .lean(),
  ]);

  // ── Chart data ───────────────────────────────────────────────────────────────

  const growthMap = Object.fromEntries(
    userGrowthRaw.map((g: any) => [g._id, g.count]),
  );
  const userGrowthData = days.map((iso) => ({
    label: dayLabel(iso),
    count: growthMap[iso] ?? 0,
  }));

  const diffMap = Object.fromEntries(
    difficultyRaw.map((d: any) => [d._id, d.count]),
  );
  const difficultyData = [
    { label: "Easy",   count: diffMap["EASY"]   ?? 0, color: "bg-emerald-500/70" },
    { label: "Medium", count: diffMap["MEDIUM"] ?? 0, color: "bg-amber-500/70"   },
    { label: "Hard",   count: diffMap["HARD"]   ?? 0, color: "bg-red-500/70"     },
  ];

  const cuisineData = cuisineRaw.map((c: any) => ({
    label: c._id,
    count: c.count,
    color: "bg-primary/60",
  }));

  const newUsersThisWeek = userGrowthData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-outfit tracking-tighter sm:text-3xl">
          System Overview
        </h1>
        <p className="text-sm text-muted-foreground font-medium mt-1 sm:text-base">
          High-level metrics and analytics across CookLens.
        </p>
      </div>

      {/* ── Stat cards (4 cols) ── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Users"
          value={userCount}
          href="/admin/users"
          linkLabel="Manage"
          color="text-primary"
          bg="bg-primary/10"
        />
        <StatCard
          icon={ChefHat}
          label="Recipes"
          value={recipeCount}
          href="/admin/recipes"
          linkLabel="Manage"
          color="text-violet-500"
          bg="bg-violet-500/10"
        />
        <StatCard
          icon={Leaf}
          label="Ingredients"
          value={ingredientCount}
          href="/admin/ingredients"
          linkLabel="Manage"
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Ingredient Swaps"
          value={substitutionCount}
          href="/admin/substitutions"
          linkLabel="Manage"
          color="text-amber-500"
          bg="bg-amber-500/10"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="New Users — Last 7 Days"
          subtitle={`${newUsersThisWeek} sign-up${newUsersThisWeek !== 1 ? "s" : ""} this week`}
        >
          <UserGrowthChart data={userGrowthData} />
        </SectionCard>

        <SectionCard
          title="Recipe Difficulty Breakdown"
          subtitle={`${recipeCount} recipes total`}
        >
          {recipeCount > 0 ? (
            <HorizontalBarList data={difficultyData} total={recipeCount} />
          ) : (
            <p className="text-sm text-muted-foreground/50 text-center py-8">No recipes yet</p>
          )}
        </SectionCard>
      </div>

      {/* ── Lists row ── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top cuisines */}
        <SectionCard title="Top Cuisines" subtitle="By number of recipes">
          {cuisineData.length > 0 ? (
            <HorizontalBarList data={cuisineData} total={recipeCount} />
          ) : (
            <p className="text-sm text-muted-foreground/50 text-center py-8">No recipes yet</p>
          )}
        </SectionCard>

        {/* Most favorited */}
        <SectionCard title="Most Favorited" subtitle="All-time top recipes">
          {topFavoritedRaw.length > 0 ? (
            <div className="space-y-3">
              {topFavoritedRaw.map((r: any, i: number) => (
                <div
                  key={r._id?.toString()}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40"
                >
                  <span className="text-[10px] font-black text-muted-foreground/40 w-4 text-right shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground/60 font-medium uppercase tracking-wider">
                      {r.cuisineType}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                    <span className="text-sm font-black tabular-nums">{r.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50 text-center py-8">No favorites yet</p>
          )}
        </SectionCard>

        {/* Recent sign-ups */}
        <SectionCard title="Recent Sign-ups" subtitle="Newest members">
          {recentUsersRaw.length > 0 ? (
            <div className="space-y-3">
              {recentUsersRaw.map((u: any) => (
                <div
                  key={u._id?.toString()}
                  className="flex flex-wrap items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/40 sm:flex-nowrap"
                >
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                    {(u.displayName ?? u.email).charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">
                      {u.displayName || "—"}
                    </p>
                    <p className="text-xs text-muted-foreground/60 truncate">{u.email}</p>
                  </div>
                  <div className="ml-11 flex shrink-0 items-center gap-1 text-muted-foreground/50 sm:ml-0">
                    <Clock className="h-3 w-3" />
                    <span className="text-[10px] font-medium whitespace-nowrap">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground/50 text-center py-8">No users yet</p>
          )}
        </SectionCard>
      </div>
    </div>
  );
}

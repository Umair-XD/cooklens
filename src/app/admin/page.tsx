import { dbConnect } from "@/lib/db/connect";
import { Recipe } from "@/lib/db/models/Recipe";
import { Ingredient } from "@/lib/db/models/Ingredient";
import { User } from "@/lib/db/models/User";
import Link from "next/link";
import { ChefHat, Leaf, ArrowRight, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  await dbConnect();
  
  const [recipeCount, ingredientCount, userCount] = await Promise.all([
    Recipe.countDocuments(),
    Ingredient.countDocuments(),
    User.countDocuments(),
  ]);

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
      <div>
        <h1 className="text-3xl font-black font-outfit tracking-tighter">System Overview</h1>
        <p className="text-muted-foreground font-medium mt-1">High-level metrics and quick access points.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Users Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Users</p>
              <h2 className="text-3xl font-black font-outfit">{userCount}</h2>
            </div>
          </div>
          <div className="relative mt-6 flex justify-end">
            <Link 
              href="/admin/users" 
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Manage Users <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Recipes Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ChefHat className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Recipes</p>
              <h2 className="text-3xl font-black font-outfit">{recipeCount}</h2>
            </div>
          </div>
          <div className="relative mt-6 flex justify-end">
            <Link 
              href="/admin/recipes" 
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Manage Recipes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Ingredients Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Leaf className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Ingredients</p>
              <h2 className="text-3xl font-black font-outfit">{ingredientCount}</h2>
            </div>
          </div>
          <div className="relative mt-6 flex justify-end">
            <Link 
              href="/admin/ingredients" 
              className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Manage Ingredients <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

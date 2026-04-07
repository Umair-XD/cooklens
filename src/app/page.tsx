import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Search,
  ChefHat,
  Heart,
  Calendar,
  ArrowRight,
  Shield,
  Smartphone,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Identify ingredients from photos",
    description:
      "Take a picture of what you have on hand. We will tell you what each ingredient is and suggest what you can cook.",
  },
  {
    icon: Search,
    title: "Search by name or cuisine",
    description:
      "Find recipes quickly using text search, filters for prep time, difficulty, or cuisine type.",
  },
  {
    icon: ChefHat,
    title: "Step-by-step instructions",
    description:
      "Every recipe includes detailed steps, prep and cook times, required utensils, and nutritional information.",
  },
  {
    icon: Heart,
    title: "Save your favorites",
    description:
      "Bookmark recipes you want to revisit. Your favorites help us understand your taste and improve suggestions.",
  },
  {
    icon: Calendar,
    title: "Plan your week",
    description:
      "Enter your stats and goals. We generate a seven-day meal plan that fits your calorie and macro targets.",
  },
  {
    icon: ArrowRight,
    title: "Smart substitutions",
    description:
      "Missing an ingredient? See viable alternatives with notes on how the swap affects the final dish.",
  },
];

const stats = [
  { value: "Thousands", label: "recipes" },
  { value: "Hundreds", label: "ingredients" },
  { value: "Free", label: "to use" },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 py-24 text-center sm:px-6 md:py-32 lg:py-40">
          <h1 className="max-w-3xl text-[2rem] font-semibold leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
            Cook what you have.
            <br />
            <span className="text-muted-foreground">Plan what you need.</span>
          </h1>

          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
            A simple tool for discovering recipes from your available
            ingredients, planning weekly meals, and following guided cooking
            instructions.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <Link href="/register">
              <Button className="gap-1.5 h-11 px-6 text-[15px] rounded-lg">
                Get started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/recipes">
              <Button
                variant="outline"
                className="h-11 px-6 text-[15px] rounded-lg"
              >
                Browse recipes
              </Button>
            </Link>
          </div>

          <div className="mt-16 flex items-center gap-10">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-semibold">{stat.value}</div>
                <div className="mt-0.5 text-[13px] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            What you can do
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Everything you need to plan meals, find recipes, and cook with
            confidence.
          </p>

          <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="flex flex-col gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted/40">
                  <feature.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="text-[15px] font-medium">{feature.title}</h3>
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-y py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
            How it works
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
            Three steps from your kitchen to your table.
          </p>

          <div className="mt-12 grid gap-12 sm:grid-cols-3">
            {[
              {
                step: "01",
                title: "Add ingredients",
                description:
                  "Type them manually, search our database, or take a photo. We will identify what you have.",
              },
              {
                step: "02",
                title: "Get recommendations",
                description:
                  "See recipes ranked by how many of your ingredients they use. Filter by time, difficulty, or cuisine.",
              },
              {
                step: "03",
                title: "Follow along",
                description:
                  "Cook step by step, adjust servings, swap missing ingredients, or plan the whole week.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-4">
                <span className="text-[13px] font-mono text-muted-foreground">
                  {item.step}
                </span>
                <h3 className="text-[15px] font-medium">{item.title}</h3>
                <p className="text-[14px] leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border bg-muted/20 p-10 text-center sm:p-14">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem]">
              Start cooking
            </h2>
            <p className="mt-3 max-w-md mx-auto text-[15px] leading-relaxed text-muted-foreground">
              Create an account to save your preferences, build meal plans, and
              keep your favorite recipes in one place.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/register">
                <Button className="gap-1.5 h-11 px-6 text-[15px] rounded-lg">
                  Create an account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="h-11 px-6 text-[15px] rounded-lg"
                >
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="border-t py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-8 gap-y-4 px-4 text-[13px] text-muted-foreground sm:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span>Secure sign-in</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4" />
            <span>Works on any device</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Meal planning built in</span>
          </div>
        </div>
      </section>
    </div>
  );
}

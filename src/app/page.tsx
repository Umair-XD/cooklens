import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FullHeader, MinimalFooter } from "@/components/AppShell";
import {
  Camera,
  Search,
  ChefHat,
  Heart,
  Calendar,
  ArrowRight,
  Shield,
  Smartphone,
  Sparkles,
  Utensils,
  History,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getServerSessionSafe } from "@/lib/auth";

const features = [
  {
    icon: Camera,
    title: "Visual Recognition",
    description:
      "Advanced computer vision identifies ingredients from a single photo of your pantry or fridge.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Search,
    title: "Intelligent Search",
    description:
      "Semantic search across thousands of globally curated recipes with multi-dimensional filtering.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    icon: ChefHat,
    title: "Culinary Guidance",
    description:
      "Professional-grade instructions with automated unit conversions and integrated timer support.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    icon: Heart,
    title: "Personal Vault",
    description:
      "Securely store and organize your favorite recipes with automatic categorization and tagging.",
    color: "text-rose-500",
    bg: "bg-rose-500/10",
  },
  {
    icon: Calendar,
    title: "Strategic Planning",
    description:
      "AI-optimized weekly schedules that align perfectly with your complex TDEE and macro-nutrient goals.",
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    icon: Sparkles,
    title: "AI Integration",
    description:
      "Interactive LLM-powered assistant for recipe adjustments, dietary swaps, and culinary coaching.",
    color: "text-violet-500",
    bg: "bg-violet-500/10",
  },
];

const stats = [
  { value: "50k+", label: "Recipes Tracked" },
  { value: "10k+", label: "Active Chefs" },
  { value: "99%", label: "Plan Precision" },
];

export default async function HomePage() {
  const session = await getServerSessionSafe();

  return (
    <>
      <FullHeader />
      <main>
      <div className="flex flex-col bg-background selection:bg-primary/20">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-10 lg:py-16 border-b border-border/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
          <h1 className="max-w-4xl text-5xl font-black leading-[1.02] tracking-tighter sm:text-7xl md:text-8xl font-outfit">
            Cook more.
            <br />
            <span className="text-muted-foreground/40">Stress less.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg md:text-xl font-medium text-muted-foreground leading-relaxed">
            Stop wondering what's for dinner. We help you find amazing recipes
            using what's already in your kitchen.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            {!session && (
              <Link href="/register">
                <Button className="h-12 px-8 text-base font-black rounded-xl shadow-xl shadow-primary/10 transition-all font-outfit">
                  Get Started
                </Button>
              </Link>
            )}
            <Link href="/recipes">
              <Button
                variant="outline"
                className="h-12 px-8 text-base font-bold rounded-xl border-border/60 hover:bg-muted font-outfit"
              >
                Browse Recipes
              </Button>
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-16 items-center">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black font-outfit tracking-tighter">
                  {stat.value}
                </div>
                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary mb-5">
                Features
              </h2>
              <h3 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter">
                Everything you need to master your kitchen.
              </h3>
            </div>
            <p className="max-w-md text-muted-foreground font-medium leading-relaxed">
              From recognizing groceries in a photo to planning a full week of
              healthy eating, we've got you covered.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <div
                key={feature.title}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card/60 glass hover:border-primary/30 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div
                  className={cn(
                    "mb-5 flex h-12 w-12 items-center justify-center rounded-xl shadow-sm transition-transform",
                    feature.bg,
                  )}
                >
                  <feature.icon className={cn("h-6 w-6", feature.color)} />
                </div>
                <h4 className="text-lg font-bold mb-2 font-outfit">
                  {feature.title}
                </h4>
                <p className="text-xs font-medium leading-relaxed text-muted-foreground/80">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 border-y border-border/40 bg-background relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black font-outfit tracking-tighter mb-4 text-primary">
              How it works
            </h2>
            <p className="text-base text-muted-foreground font-medium max-w-xl mx-auto">
              From scanning your fridge to the first bite.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                step: "01",
                icon: Zap,
                title: "Snap your food",
                description:
                  "Just take a photo of what you have. We'll recognize your ingredients instantly.",
              },
              {
                step: "02",
                icon: History,
                title: "Get recipe ideas",
                description:
                  "We'll find recipes you can actually make with what's in your kicthen.",
              },
              {
                step: "03",
                icon: Utensils,
                title: "Cook & Enjoy",
                description:
                  "Follow simple steps and enjoy a healthy home-cooked meal in minutes.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative flex flex-col gap-4 p-6 rounded-2xl border border-border/40 bg-card/10"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 border border-primary/10">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold font-outfit">{item.title}</h3>
                <p className="text-sm font-medium leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative p-12 md:p-16 rounded-4xl border border-primary/10 bg-primary/5 text-center">
            <h2 className="text-4xl md:text-5xl font-black font-outfit tracking-tighter mb-4">
              Join CookLens. <br />
              <span className="text-primary italic">Start cooking today.</span>
            </h2>
            <p className="max-w-xl mx-auto text-base font-medium text-muted-foreground/80 mb-8">
              Join thousands of home cooks making their lives easier and
              healthier. Save your favorite recipes and plan your meals in
              seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {!session && (
                <Link href="/register">
                  <Button className="h-12 px-8 text-base font-black rounded-xl shadow-xl shadow-primary/10 transition-all font-outfit">
                    Get Started for Free
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
      </div>
      </main>
      <MinimalFooter />
    </>
  );
}

function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

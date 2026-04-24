import Link from "next/link";
import { ChefHat, Search, Calendar, Heart, MessageSquare } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { MobileNav } from "@/components/MobileNav";
import { UserNav } from "@/components/UserNav";
import { getServerSessionSafe } from "@/lib/auth";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: Search },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/chat", label: "Assistant", icon: MessageSquare },
];



export async function FullHeader() {
  const session = await getServerSessionSafe();

  return (
    <header className="sticky top-0 z-50 w-full h-16 border-b border-border/40 bg-background/60 backdrop-blur-xl flex items-center shrink-0">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
              <ChefHat className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-black tracking-tighter font-outfit">CookLens</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-muted/30 p-1 rounded-2xl border border-border/50 glass">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-background/80 transition-all"
            >
              <link.icon className="h-3.5 w-3.5" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="pr-2 border-r border-border/50 hidden sm:block">
            <ThemeToggle />
          </div>
          <UserNav session={session} />
          {/* Mobile Navigation */}
          <MobileNav session={session} />
        </div>
      </div>
    </header>
  );
}

export function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 w-full bg-transparent">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <ChefHat className="h-5 w-5 fill-current" />
          </div>
          <span className="text-xl font-black tracking-tighter font-outfit">CookLens</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}

export function MinimalFooter() {
  return (
    <footer className="border-t border-border/40 bg-muted/10 py-12">
      <div className="mx-auto flex flex-col md:flex-row items-center justify-between max-w-7xl px-6 gap-6">
        <div className="flex flex-col gap-2 items-center md:items-start">
          <div className="flex items-center gap-2 opacity-40">
            <ChefHat className="h-4 w-4" />
            <span className="text-sm font-black tracking-tighter uppercase">CookLens</span>
          </div>
          <p className="text-[11px] font-bold text-muted-foreground/60 uppercase tracking-widest">&copy; {new Date().getFullYear()} CookLens</p>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/privacy" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}

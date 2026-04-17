import Link from "next/link";
import { ChefHat, Search, Calendar, Heart, MessageSquare, User, LogOut, Settings } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/MobileNav";
import { getServerSessionSafe } from "@/lib/auth";
import { signOut } from "@/lib/actions/auth.actions";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: Search },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/chat", label: "Assistant", icon: MessageSquare },
];

async function UserNav() {
  const session = await getServerSessionSafe();

  if (!session?.user) {
    return (
      <div className="hidden sm:flex items-center gap-2">
        <Link
          href="/login"
          className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/20 transition-all font-outfit"
        >
          Join
        </Link>
      </div>
    );
  }

  const initials = (session.user.name || session.user.email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full outline-none hover:bg-accent/50 p-1 group transition-all">
          <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-primary/20 transition-all">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">{initials}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl glass shadow-premium border-border/50">
        <DropdownMenuLabel className="font-normal p-3">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-black tracking-tight">{session.user.name}</p>
            <p className="text-xs font-medium text-muted-foreground truncate">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <div className="py-1">
          <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 cursor-pointer p-2.5">
            <Link href="/profile" className="flex items-center gap-2.5 font-bold text-sm">
              <User className="h-4 w-4 text-primary" />
              Account Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 cursor-pointer p-2.5">
            <Link href="/favorites" className="flex items-center gap-2.5 font-bold text-sm">
              <Heart className="h-4 w-4 text-primary" />
              Saved Recipes
            </Link>
          </DropdownMenuItem>
        </div>
        {session.user.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator className="bg-border/50" />
            <DropdownMenuItem asChild className="rounded-xl focus:bg-primary/5 cursor-pointer p-2.5">
              <Link href="/admin/recipes" className="flex items-center gap-2.5 font-bold text-sm">
                <Settings className="h-4 w-4 text-primary" />
                Kitchen Admin
              </Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem asChild className="rounded-xl focus:bg-destructive/5 text-destructive cursor-pointer p-2.5">
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="w-full"
          >
            <button type="submit" className="w-full flex items-center gap-2.5 font-bold text-sm">
              <LogOut className="h-4 w-4" />
              Terminate Session
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

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
          <UserNav />
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

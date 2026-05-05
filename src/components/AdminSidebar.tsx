"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ChefHat,
  Leaf,
  Users,
  ArrowLeftRight,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Recipes", href: "/admin/recipes", icon: ChefHat },
  { name: "Ingredients", href: "/admin/ingredients", icon: Leaf },
  { name: "Swaps", href: "/admin/substitutions", icon: ArrowLeftRight },
  { name: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl lg:flex">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border/40 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <ChefHat className="h-5 w-5" />
        </div>
        <span className="font-outfit font-black tracking-tight text-lg">
          CookLens <span className="text-primary">Admin</span>
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
              {item.name}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-2 border-t border-border/40 p-4">
        <Link
          href="/"
          className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit to App
        </Link>
        <ThemeToggle />
      </div>
    </aside>

    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-card/90 backdrop-blur-xl lg:hidden">
      <div className="flex h-16 items-center justify-between px-4">
        <Link href="/admin" className="flex min-w-0 items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <ChefHat className="h-5 w-5" />
          </div>
          <span className="truncate font-outfit text-base font-black tracking-tight">
            CookLens <span className="text-primary">Admin</span>
          </span>
        </Link>
        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />
          <Link
            href="/"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            aria-label="Exit to app"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>

    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-card/95 px-2 py-2 backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex min-w-0 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-black transition-all",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="max-w-full truncate">{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
    </>
  );
}

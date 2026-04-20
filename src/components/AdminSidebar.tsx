"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ChefHat, 
  Leaf, 
  Users, 
  Settings, 
  LogOut,
  ArrowLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Recipes", href: "/admin/recipes", icon: ChefHat },
  { name: "Ingredients", href: "/admin/ingredients", icon: Leaf },
  { name: "Users", href: "/admin/users", icon: Users },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-border/40 bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center gap-3 px-6 border-b border-border/40">
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

      <div className="p-4 border-t border-border/40 space-y-1">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Exit to App
        </Link>
      </div>
    </aside>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Calendar, Heart, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: Search },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/favorites", label: "Saved", icon: Heart },
  { href: "/chat", label: "Chat", icon: MessageSquare },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav() {
  const pathname = usePathname();
  const activeIndex = navLinks.findIndex((link) => isActivePath(pathname, link.href));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/40 bg-background/92 px-3 pb-[max(env(safe-area-inset-bottom),0.45rem)] pt-1.5 backdrop-blur-xl lg:hidden">
      <div className="relative mx-auto grid max-w-md grid-cols-4 rounded-xl border border-border/50 bg-card/80 p-1 shadow-premium">
        {activeIndex >= 0 && (
          <div
            className="absolute bottom-1 left-1 top-1 w-[calc((100%_-_0.5rem)/4)] rounded-xl bg-primary shadow-lg shadow-primary/25 transition-transform duration-300 ease-out"
            style={{ transform: `translateX(calc(${activeIndex} * 100%))` }}
            aria-hidden="true"
          />
        )}

        {navLinks.map((link) => {
          const active = isActivePath(pathname, link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative z-10 flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[10px] font-black transition-colors duration-300",
                active
                  ? "text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <link.icon
                className={cn(
                  "h-4 w-4 transition-transform duration-300",
                  active && "-translate-y-0.5 scale-110 drop-shadow-sm",
                )}
              />
              <span className="max-w-full truncate">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

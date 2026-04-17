"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, ChefHat, Search, Calendar, Heart, MessageSquare, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/recipes", label: "Recipes", icon: Search },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/favorites", label: "Favorites", icon: Heart },
  { href: "/chat", label: "Assistant", icon: MessageSquare },
];

interface MobileNavProps {
  session: any;
}

export function MobileNav({ session }: MobileNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Lock body scroll when open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);

  const drawerContent = (
    <>
      {/* Overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-100 bg-black/80 transition-opacity duration-300",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-110 p-0 border-l border-border/50 glass shadow-premium w-[85%] max-w-[320px] bg-background/60 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-6 border-b border-border/20 flex items-center justify-between">
           <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <ChefHat className="h-4 w-4 fill-current" />
              </div>
              <span className="font-outfit font-black tracking-tighter text-lg">CookLens</span>
           </div>
           <button 
             onClick={closeMenu} 
             className="p-2 rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
             aria-label="Close menu"
           >
             <X className="h-5 w-5" />
           </button>
        </div>
        
        <div className="px-4 py-6 flex flex-col gap-2 flex-1 overflow-y-auto">
           {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="flex items-center gap-4 p-4 rounded-2xl text-sm font-bold text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all group"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/30 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <link.icon className="h-5 w-5" />
                </div>
                {link.label}
              </Link>
           ))}
        </div>
        
        <div className="p-6 border-t border-border/20 flex flex-col gap-4 mt-auto">
           <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground/60">Interface Mode</span>
              <ThemeToggle />
           </div>
           {!session?.user && (
              <div className="grid grid-cols-2 gap-3">
                 <Link href="/login" onClick={closeMenu} className="flex items-center justify-center h-11 rounded-xl text-xs font-bold bg-muted/50 hover:bg-accent transition-colors">Login</Link>
                 <Link href="/register" onClick={closeMenu} className="flex items-center justify-center h-11 rounded-xl text-xs font-bold bg-primary text-primary-foreground shadow-lg shadow-primary/20">Join</Link>
              </div>
           )}
        </div>
      </div>
    </>
  );

  return (
    <div className="lg:hidden">
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
        aria-label="Toggle mobile menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mounted && createPortal(drawerContent, document.body)}
    </div>
  );
}

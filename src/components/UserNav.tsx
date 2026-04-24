"use client";

import * as React from "react";
import Link from "next/link";
import { User, Heart, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

interface UserNavProps {
  session: any;
}

export function UserNav({ session }: UserNavProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

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
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full outline-none hover:bg-accent/50 p-1 group transition-all"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar className="h-8 w-8 border-2 border-transparent group-hover:border-primary/20 transition-all pointer-events-none">
          <AvatarImage src={session.user.image || undefined} />
          <AvatarFallback className="text-xs font-black bg-primary/10 text-primary">{initials}</AvatarFallback>
        </Avatar>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-64 p-2 rounded-2xl glass shadow-premium border border-border/50 z-[100] animate-in fade-in zoom-in-95 duration-200 origin-top-right"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="font-normal p-3">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-black tracking-tight">{session.user.name}</p>
              <p className="text-xs font-medium text-muted-foreground truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          
          <div className="h-px bg-border/50 my-1 mx-1" />
          
          <div className="py-1 flex flex-col gap-1">
            <Link 
              href="/profile" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 font-bold text-sm rounded-xl hover:bg-primary/5 cursor-pointer p-2.5 transition-colors"
            >
              <User className="h-4 w-4 text-primary" />
              Account Profile
            </Link>
            <Link 
              href="/favorites" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 font-bold text-sm rounded-xl hover:bg-primary/5 cursor-pointer p-2.5 transition-colors"
            >
              <Heart className="h-4 w-4 text-primary" />
              Saved Recipes
            </Link>
          </div>

          {session.user.role === "ADMIN" && (
            <>
              <div className="h-px bg-border/50 my-1 mx-1" />
              <Link 
                href="/admin/recipes" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2.5 font-bold text-sm rounded-xl hover:bg-primary/5 cursor-pointer p-2.5 transition-colors"
              >
                <Settings className="h-4 w-4 text-primary" />
                Kitchen Admin
              </Link>
            </>
          )}

          <div className="h-px bg-border/50 my-1 mx-1" />
          
          <button 
            className="w-full flex items-center gap-2.5 font-bold text-sm rounded-xl hover:bg-destructive/5 text-destructive cursor-pointer p-2.5 transition-colors text-left"
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/login" });
            }}
          >
            <LogOut className="h-4 w-4" />
            Terminate Session
          </button>
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { getServerSessionSafe } from "@/lib/auth";
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
import { Providers } from "@/components/Providers";
import Link from "next/link";
import { signOut } from "@/lib/actions/auth.actions";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "CookLens",
    template: "%s — CookLens",
  },
  description:
    "Recipe discovery and meal planning. Find what to cook from what you have.",
};

const navLinks = [
  { href: "/recipes", label: "Recipes" },
  { href: "/planner", label: "Planner" },
  { href: "/favorites", label: "Favorites" },
  { href: "/chat", label: "Chat" },
];

async function UserNav() {
  const session = await getServerSessionSafe();

  if (!session?.user) {
    return (
      <div className="flex items-center gap-1">
        <Link
          href="/login"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-9 w-9 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </Link>
        <Link
          href="/register"
          className="inline-flex items-center justify-center rounded-lg text-sm font-medium h-9 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Sign up
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
        <button className="flex items-center gap-2 rounded-full outline-none hover:bg-accent p-1 pr-3 transition-colors">
          <Avatar className="h-7 w-7">
            <AvatarImage src={session.user.image || undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium">
            {session.user.name?.split(" ")[0] || session.user.email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{session.user.name}</p>
            <p className="text-xs text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/favorites">Favorites</Link>
        </DropdownMenuItem>
        {session.user.role === "ADMIN" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/recipes">Admin</Link>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
          >
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

async function FullHeader() {
  const session = await getServerSessionSafe();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
              CL
            </div>
            CookLens
          </Link>

          {session?.user && (
            <nav className="hidden md:flex items-center gap-0.5">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex items-center rounded-md px-3 py-1.5 text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-accent/60 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}

async function AuthHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-foreground text-background text-xs font-bold">
            CL
          </div>
          CookLens
        </Link>

        <div className="flex items-center gap-1">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function MinimalFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 text-[13px] text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} CookLens</p>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="hover:text-foreground transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="hover:text-foreground transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-nextjs-pathname") || "";
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register");
  const session = await getServerSessionSafe();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          storageKey="cooklens-theme"
        >
          <Providers>
            <div className="flex min-h-screen flex-col">
              {isAuthPage ? <AuthHeader /> : <FullHeader />}
              <main className="flex-1">{children}</main>
              {isAuthPage || !session?.user ? <MinimalFooter /> : null}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

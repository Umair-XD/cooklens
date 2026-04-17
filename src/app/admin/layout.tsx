import { getServerSessionSafe } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSessionSafe();

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-4xl font-bold text-destructive">403</h1>
        <p className="text-lg text-muted-foreground">
          Access denied. Admin privileges required.
        </p>
        <Link
          href="/"
          className="text-sm text-primary underline underline-offset-4"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage recipes and ingredients
        </p>
      </div>
      <nav className="flex gap-1 mb-8">
        <Link
          href="/admin/recipes"
          className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-[13px] font-medium"
        >
          Recipes
        </Link>
        <Link
          href="/admin/ingredients"
          className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-[13px] font-medium"
        >
          Ingredients
        </Link>
      </nav>
      {children}
    </div>
  );
}

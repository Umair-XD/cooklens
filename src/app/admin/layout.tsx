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
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Manage recipes and ingredients
        </p>
      </div>
      <nav className="flex gap-4 mb-8">
        <Link
          href="/admin/recipes"
          className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium"
        >
          Recipes
        </Link>
        <Link
          href="/admin/ingredients"
          className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-sm font-medium"
        >
          Ingredients
        </Link>
      </nav>
      {children}
    </div>
  );
}

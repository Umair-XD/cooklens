import { getServerSessionSafe } from "@/lib/auth";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminSidebar } from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSessionSafe();

  if (!session || session.user.role !== "ADMIN") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background gap-4">
        <h1 className="text-4xl font-bold text-destructive">403</h1>
        <p className="text-lg text-muted-foreground">
          Access denied. Admin privileges required.
        </p>
        <Link
          href="/"
          className="text-sm text-primary underline underline-offset-4 font-medium"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <AdminSidebar />
      <div className="pl-64 flex flex-col min-h-screen transition-all duration-300">
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

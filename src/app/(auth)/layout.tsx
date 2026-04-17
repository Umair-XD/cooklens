import { AuthHeader } from "@/components/AppShell";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuthHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}

import { FullHeader } from "@/components/AppShell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FullHeader />
      <main className="flex-1">{children}</main>
    </>
  );
}

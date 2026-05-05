import { FullHeader } from "@/components/AppShell";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <FullHeader />
      <main className="flex-1 pb-24 lg:pb-0">{children}</main>
    </>
  );
}

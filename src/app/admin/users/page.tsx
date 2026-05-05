import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { Metadata } from "next";
import { UserManager } from "@/components/UserManager";
import { getServerSessionSafe } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Manage Users - Admin Dashboard",
};

export default async function UsersPage() {
  const session = await getServerSessionSafe();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  await dbConnect();
  
  const users = await User.find().sort({ createdAt: -1 }).select("-passwordHash").lean();

  const userData = JSON.parse(JSON.stringify(users)).map((u: any) => ({
    _id: u._id,
    email: u.email,
    displayName: u.displayName,
    role: u.role,
    createdAt: u.createdAt,
  }));

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-black font-outfit tracking-tighter sm:text-3xl">Manage Users</h1>
          <p className="mt-1 text-sm font-medium text-muted-foreground sm:text-base">View and manage system users and roles.</p>
        </div>
      </div>

      <UserManager 
        users={userData} 
        currentUserId={session.user.id} 
      />
    </div>
  );
}

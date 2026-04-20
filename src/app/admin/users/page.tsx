import { dbConnect } from "@/lib/db/connect";
import { User } from "@/lib/db/models/User";
import { formatDistanceToNow } from "date-fns";
import { Users, Shield, ShieldAlert, MoreVertical } from "lucide-react";
import { Metadata } from "next";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export const metadata: Metadata = {
  title: "Manage Users - Admin Dashboard",
};

export default async function UsersPage() {
  await dbConnect();
  
  const users = await User.find().sort({ createdAt: -1 }).select("-passwordHash").lean();

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-black font-outfit tracking-tighter">Manage Users</h1>
          <p className="text-muted-foreground font-medium mt-1">View and manage system users and roles.</p>
        </div>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/30 text-xs uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-6 py-4 font-black">User</th>
                <th className="px-6 py-4 font-black">Role</th>
                <th className="px-6 py-4 font-black">Joined</th>
                <th className="px-6 py-4 font-black text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {users.map((user: any) => (
                <tr key={user._id.toString()} className="hover:bg-muted/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20">
                        <AvatarFallback className="font-bold text-xs">
                          {user.displayName?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-bold">{user.displayName || "No Name"}</div>
                        <div className="text-muted-foreground text-xs">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      {user.role === "ADMIN" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-destructive">
                          <ShieldAlert className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-secondary-foreground">
                          <Shield className="h-3 w-3" /> User
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                    {user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : "Unknown"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="h-8 w-8 inline-flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-colors focus:outline-hidden">
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-3 opacity-20" />
                    <p className="font-medium">No users found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

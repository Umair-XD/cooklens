"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  ShieldAlert,
  Trash2,
  MoreVertical,
  Check,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { updateUserRole, deleteUser } from "@/lib/actions/admin.actions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserRecord {
  _id: string;
  email: string;
  displayName?: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}

interface UserManagerProps {
  users: UserRecord[];
  currentUserId: string;
}

function UserActionCell({ 
  user, 
  currentUserId,
  isLast 
}: { 
  user: UserRecord, 
  currentUserId: string,
  isLast?: boolean
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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

  const handleRoleUpdate = async (newRole: "USER" | "ADMIN") => {
    setIsUpdating(true);
    setIsOpen(false);
    try {
      const result = await updateUserRole(user._id, newRole);
      if (result.success) {
        toast.success(`User role updated to ${newRole}`);
        router.refresh();
      } else {
        toast.error("Failed to update role");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteUser(user._id);
      if (result.success) {
        toast.success("User deleted successfully");
        router.refresh();
      } else {
        toast.error("Failed to delete user");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };

  return (
    <div className="relative flex justify-end" ref={containerRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-lg hover:bg-muted transition-all"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isUpdating || isDeleting}
      >
        <MoreVertical className="h-4 w-4" />
      </Button>

      {isOpen && (
        <div className={cn(
          "absolute right-0 w-48 p-1.5 rounded-xl bg-background shadow-premium border border-border/50 z-50 animate-in fade-in zoom-in-95 duration-200",
          isLast ? "bottom-full mb-1 origin-bottom-right" : "top-full mt-1 origin-top-right"
        )}>
          <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1.5">
            Manage User
          </div>
          <div className="h-px bg-border/50 my-1 mx-0.5" />
          
          <button 
            className={cn(
              "w-full flex items-center gap-2.5 font-bold text-sm rounded-lg p-2.5 transition-colors text-left",
              user.role === "USER" || user._id === currentUserId ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5 cursor-pointer"
            )}
            disabled={user.role === "USER" || user._id === currentUserId}
            onClick={() => handleRoleUpdate("USER")}
          >
            <Shield className="h-4 w-4 text-primary" />
            Set as User
            {user.role === "USER" && <Check className="h-3 w-3 ml-auto" />}
          </button>
          
          <button 
            className={cn(
              "w-full flex items-center gap-2.5 font-bold text-sm rounded-lg p-2.5 transition-colors text-left",
              user.role === "ADMIN" ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/5 cursor-pointer"
            )}
            disabled={user.role === "ADMIN"}
            onClick={() => handleRoleUpdate("ADMIN")}
          >
            <ShieldAlert className="h-4 w-4 text-destructive" />
            Grant Admin
            {user.role === "ADMIN" && <Check className="h-3 w-3 ml-auto" />}
          </button>

          <div className="h-px bg-border/50 my-1 mx-0.5" />
          
          <button 
            className={cn(
              "w-full flex items-center gap-2.5 font-bold text-sm rounded-lg p-2.5 transition-colors text-left text-destructive focus:bg-destructive/5",
              user._id === currentUserId ? "opacity-50 cursor-not-allowed" : "hover:bg-destructive/5 cursor-pointer"
            )}
            disabled={user._id === currentUserId}
            onClick={() => {
              setIsOpen(false);
              setDeleteConfirmOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete Account
          </button>
        </div>
      )}

      <DeleteConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete User"
        description="This will permanently delete the user account and all associated data. This action is irreversible."
        itemName={user.email}
        onConfirm={handleDelete}
      />
    </div>
  );
}

export function UserManager({ users, currentUserId }: UserManagerProps) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card shadow-sm overflow-visible">
      <div className="overflow-visible">
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
            {users.map((user, index) => (
              <tr
                key={user._id}
                className="hover:bg-muted/20 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 bg-primary/10 text-primary border border-primary/20 transition-transform group-hover:scale-105">
                      <AvatarFallback className="font-bold text-xs">
                        {user.displayName?.charAt(0).toUpperCase() ||
                          user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-bold">
                        {user.displayName || "No Name"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {user.email}
                      </div>
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
                  {user.createdAt
                    ? formatDistanceToNow(new Date(user.createdAt), {
                        addSuffix: true,
                      })
                    : "Unknown"}
                </td>
                <td className="px-6 py-4">
                  <UserActionCell 
                    user={user} 
                    currentUserId={currentUserId} 
                    isLast={index >= users.length - 2} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

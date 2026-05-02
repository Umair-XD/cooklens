import { redirect } from "next/navigation";
import { getServerSessionSafe } from "@/lib/auth";
import { dbConnect } from "@/lib/db/connect";
import { User, type IUser } from "@/lib/db/models/User";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await getServerSessionSafe();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean<IUser>();
  if (!user) redirect("/login");

  return (
    <ProfileClient
      user={{
        id: (user._id as any).toString(),
        email: user.email,
        displayName: user.displayName ?? "",
        photoUrl: user.photoUrl ?? null,
        preferences: {
          cuisineTypes: user.preferences?.cuisineTypes?.map(String) ?? [],
          dietaryRestrictions: user.preferences?.dietaryRestrictions?.map(String) ?? [],
          dislikedIngredients: user.preferences?.dislikedIngredients?.map(String) ?? [],
        },
      }}
    />
  );
}

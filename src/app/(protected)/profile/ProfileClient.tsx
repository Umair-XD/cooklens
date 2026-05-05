"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { User, Mail, UtensilsCrossed, Leaf, ThumbsDown, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MultiSelect, type MultiSelectOption } from "@/components/MultiSelect";
import { updateUserProfile, updateUserPreferences } from "@/lib/actions/auth.actions";
import { ImageUploader } from "@/components/ImageUploader";
import { cn } from "@/lib/utils";

const CUISINE_OPTIONS: MultiSelectOption[] = [
  { label: "Italian", value: "italian" },
  { label: "Chinese", value: "chinese" },
  { label: "Japanese", value: "japanese" },
  { label: "Mexican", value: "mexican" },
  { label: "Indian", value: "indian" },
  { label: "Thai", value: "thai" },
  { label: "French", value: "french" },
  { label: "Mediterranean", value: "mediterranean" },
  { label: "Korean", value: "korean" },
  { label: "American", value: "american" },
];

const DIETARY_OPTIONS: MultiSelectOption[] = [
  { label: "Vegetarian", value: "vegetarian" },
  { label: "Vegan", value: "vegan" },
  { label: "Gluten-Free", value: "gluten-free" },
  { label: "Dairy-Free", value: "dairy-free" },
  { label: "Keto", value: "keto" },
  { label: "Paleo", value: "paleo" },
  { label: "Low-Carb", value: "low-carb" },
  { label: "Halal", value: "halal" },
];

const DISLIKED_INGREDIENT_OPTIONS: MultiSelectOption[] = [
  { label: "Mushrooms", value: "mushrooms" },
  { label: "Olives", value: "olives" },
  { label: "Anchovies", value: "anchovies" },
  { label: "Cilantro", value: "cilantro" },
  { label: "Blue Cheese", value: "blue cheese" },
  { label: "Brussels Sprouts", value: "brussels sprouts" },
  { label: "Eggplant", value: "eggplant" },
  { label: "Tofu", value: "tofu" },
];

export interface ProfileUser {
  id: string;
  email: string;
  displayName: string;
  photoUrl?: string | null;
  preferences?: {
    cuisineTypes?: string[];
    dietaryRestrictions?: string[];
    dislikedIngredients?: string[];
  };
}

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const session = useSession();
  const updateSession = session?.update;

  const [profilePending, startProfileTransition] = useTransition();
  const [prefPending, startPrefTransition] = useTransition();

  const [displayName, setDisplayName] = useState(user.displayName ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl ?? "");

  const [cuisineTypes, setCuisineTypes] = useState<string[]>(user.preferences?.cuisineTypes ?? []);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(user.preferences?.dietaryRestrictions ?? []);
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>(user.preferences?.dislikedIngredients ?? []);

  const initials = (displayName || email || "U")
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSaveProfile = () => {
    startProfileTransition(async () => {
      const result = await updateUserProfile(user.id, { displayName, email, photoUrl });
      if (!result.success) {
        toast.error(result.errors?.[0]?.message ?? "Failed to update profile");
        return;
      }
      toast.success("Profile saved!");
      await updateSession?.();
    });
  };

  const handleSavePreferences = () => {
    startPrefTransition(async () => {
      const result = await updateUserPreferences(user.id, {
        cuisineTypes,
        dietaryRestrictions,
        dislikedIngredients,
      });
      if (!result.success) {
        toast.error(result.errors?.[0]?.message ?? "Failed to update preferences");
        return;
      }
      toast.success("Preferences saved!");
    });
  };

  return (
    <div className="min-h-screen bg-background/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500" style={{ animationFillMode: "both" }}>
          <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs mb-3">
            <User className="h-3.5 w-3.5" />
            Account
          </div>
          <h1 className="text-4xl font-black font-outfit tracking-tighter lg:text-5xl">
            Your <span className="text-primary italic">Profile</span>
          </h1>
          <p className="text-muted-foreground mt-2 text-sm font-medium">
            Manage your identity and personalize your cooking experience.
          </p>
        </div>

        {/* Two equal-height cards */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">

          {/* ── Account Info (2 cols) ── */}
          <div
            className="lg:col-span-2 flex flex-col rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "100ms", animationFillMode: "both" }}
          >
            {/* Card header */}
            <div className="flex items-start gap-3 p-6 pb-4 border-b border-border/40">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Identity</p>
                <h2 className="text-sm font-black font-outfit tracking-tight">Account Info</h2>
                <p className="text-xs text-muted-foreground">Update your name and email address</p>
              </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 gap-5 p-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <ImageUploader
                  variant="avatar"
                  folder="cooklens/avatars"
                  value={photoUrl || undefined}
                  onChange={setPhotoUrl}
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate">{displayName || "—"}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
              </div>

              <div className="h-px bg-border/40" />

              <div className="space-y-1.5">
                <Label htmlFor="displayName" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Display Name
                </Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="rounded-xl"
                />
              </div>

              {/* Push save button to bottom */}
              <div className="flex-1" />

              <Button
                onClick={handleSaveProfile}
                disabled={profilePending}
                className="w-full rounded-xl font-bold shadow-lg shadow-primary/20 h-10"
              >
                {profilePending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Save Profile
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ── Preferences (3 cols) ── */}
          <div
            className="lg:col-span-3 flex flex-col rounded-xl border border-border/50 bg-card/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: "200ms", animationFillMode: "both" }}
          >
            {/* Card header */}
            <div className="flex items-start gap-3 p-6 pb-4 border-b border-border/40">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Leaf className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-primary/70">Personalization</p>
                <h2 className="text-sm font-black font-outfit tracking-tight">Preferences</h2>
                <p className="text-xs text-muted-foreground">Shape your recipe feed and AI recommendations</p>
              </div>
            </div>

            {/* Card body */}
            <div className="flex flex-col flex-1 gap-5 p-6">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <UtensilsCrossed className="h-3 w-3" />
                  Favourite Cuisines
                </Label>
                <MultiSelect
                  options={CUISINE_OPTIONS}
                  selected={cuisineTypes}
                  onChange={setCuisineTypes}
                  placeholder="Pick cuisines you love…"
                  searchPlaceholder="Search cuisines…"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Leaf className="h-3 w-3" />
                  Dietary Restrictions
                </Label>
                <MultiSelect
                  options={DIETARY_OPTIONS}
                  selected={dietaryRestrictions}
                  onChange={setDietaryRestrictions}
                  placeholder="Any dietary needs…"
                  searchPlaceholder="Search restrictions…"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <ThumbsDown className="h-3 w-3" />
                  Disliked Ingredients
                </Label>
                <MultiSelect
                  options={DISLIKED_INGREDIENT_OPTIONS}
                  selected={dislikedIngredients}
                  onChange={setDislikedIngredients}
                  placeholder="Things you'd rather skip…"
                  searchPlaceholder="Search ingredients…"
                />
              </div>

              {/* Push save button to bottom */}
              <div className="flex-1" />

              <Button
                onClick={handleSavePreferences}
                disabled={prefPending}
                className="w-full rounded-xl font-bold shadow-lg shadow-primary/20 h-10"
              >
                {prefPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Save Preferences
                  </>
                )}
              </Button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

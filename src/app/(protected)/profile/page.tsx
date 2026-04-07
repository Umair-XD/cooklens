"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MultiSelect, type MultiSelectOption } from "@/components/MultiSelect";
import {
  updateUserProfile,
  updateUserPreferences,
} from "@/lib/actions/auth.actions";

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

export function ProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Skeleton className="h-9 w-48 mb-8" />
      <div className="space-y-8">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-5 w-56" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface PreferencesFormProps {
  initialPreferences?: {
    cuisineTypes?: string[];
    dietaryRestrictions?: string[];
    dislikedIngredients?: string[];
  };
  userId: string;
}

export function PreferencesForm({
  initialPreferences,
  userId,
}: PreferencesFormProps) {
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cuisineTypes, setCuisineTypes] = useState<string[]>(
    initialPreferences?.cuisineTypes ?? [],
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    initialPreferences?.dietaryRestrictions ?? [],
  );
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>(
    initialPreferences?.dislikedIngredients ?? [],
  );

  const handleSave = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateUserPreferences(userId, {
        cuisineTypes,
        dietaryRestrictions,
        dislikedIngredients,
      });
      if (!result.success) {
        setError(result.errors?.[0]?.message ?? "Failed to update preferences");
        return;
      }
      setSuccess(true);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferences</CardTitle>
        <CardDescription>
          Customize your recipe recommendations and filters
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>Cuisine Types</Label>
          <MultiSelect
            options={CUISINE_OPTIONS}
            selected={cuisineTypes}
            onChange={setCuisineTypes}
            placeholder="Select cuisines..."
            searchPlaceholder="Search cuisines..."
          />
        </div>

        <div className="space-y-2">
          <Label>Dietary Restrictions</Label>
          <MultiSelect
            options={DIETARY_OPTIONS}
            selected={dietaryRestrictions}
            onChange={setDietaryRestrictions}
            placeholder="Select restrictions..."
            searchPlaceholder="Search restrictions..."
          />
        </div>

        <div className="space-y-2">
          <Label>Disliked Ingredients</Label>
          <MultiSelect
            options={DISLIKED_INGREDIENT_OPTIONS}
            selected={dislikedIngredients}
            onChange={setDislikedIngredients}
            placeholder="Select ingredients..."
            searchPlaceholder="Search ingredients..."
          />
        </div>

        {success && (
          <p className="text-sm text-green-600 dark:text-green-400">
            Preferences updated successfully!
          </p>
        )}

        <Button onClick={handleSave} disabled={isPending} className="w-full">
          {isPending ? "Saving..." : "Save Preferences"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ProfilePage({
  user,
}: {
  user: {
    id: string;
    email: string;
    displayName: string;
    photoUrl?: string | null;
    preferences?: {
      cuisineTypes?: string[];
      dietaryRestrictions?: string[];
      dislikedIngredients?: string[];
    };
  };
}) {
  const session = useSession();
  const updateSession = session?.update;
  const [isPending, startTransition] = useTransition();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl ?? "");
  const [cuisineTypes, setCuisineTypes] = useState<string[]>(
    user?.preferences?.cuisineTypes ?? [],
  );
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>(
    user?.preferences?.dietaryRestrictions ?? [],
  );
  const [dislikedIngredients, setDislikedIngredients] = useState<string[]>(
    user?.preferences?.dislikedIngredients ?? [],
  );

  if (session?.status === "loading" || !session?.data || !user) {
    return <ProfileSkeleton />;
  }

  const handleSaveProfile = () => {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updateUserProfile(user.id, {
        displayName,
        email,
        photoUrl,
      });
      if (!result.success) {
        setError(result.errors?.[0]?.message ?? "Failed to update profile");
        return;
      }
      setSuccess(true);
      await updateSession();
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Profile Settings
      </h1>

      {error && (
        <div className="mb-4 rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account information and appearance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoUrl || undefined} alt={displayName} />
              <AvatarFallback className="text-2xl">
                {displayName?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your display name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          {success && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Profile updated successfully!
            </p>
          )}

          <Button
            onClick={handleSaveProfile}
            disabled={isPending}
            className="w-full"
          >
            {isPending ? "Saving..." : "Save Profile"}
          </Button>
        </CardContent>
      </Card>

      <PreferencesForm userId={user.id} initialPreferences={user.preferences} />
    </div>
  );
}

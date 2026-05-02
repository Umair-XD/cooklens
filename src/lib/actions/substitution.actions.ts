"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";
import { getServerSessionSafe } from "@/lib/auth";
import { dbConnect } from "@/lib/db/connect";
import { IngredientSubstitution } from "@/lib/db/models/IngredientSubstitution";
import { Ingredient } from "@/lib/db/models/Ingredient";

async function requireAdmin() {
  const session = await getServerSessionSafe();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { success: false as const, error: "Unauthorized" };
  }
  return { success: true as const };
}

export interface SubstitutionRow {
  _id: string;
  fromIngredientId: string;
  fromName: string;
  toIngredientId: string;
  toName: string;
  impactNote: string;
}

export async function getAllSubstitutions(): Promise<SubstitutionRow[]> {
  const auth = await requireAdmin();
  if (!auth.success) return [];

  await dbConnect();
  const subs = await IngredientSubstitution.find().lean<{ _id: unknown; fromIngredientId: any; toIngredientId: any; impactNote: string }[]>();

  // Fetch ingredient names in one shot
  const ids = [
    ...new Set(subs.flatMap((s) => [s.fromIngredientId.toString(), s.toIngredientId.toString()])),
  ];
  const ingredients = await Ingredient.find({ _id: { $in: ids } })
    .select("canonicalName")
    .lean<{ _id: unknown; canonicalName: string }[]>();
  const nameMap = Object.fromEntries(ingredients.map((i) => [(i._id as any).toString(), i.canonicalName]));

  return subs.map((s) => ({
    _id: (s._id as any).toString(),
    fromIngredientId: s.fromIngredientId.toString(),
    fromName: nameMap[s.fromIngredientId.toString()] ?? "Unknown",
    toIngredientId: s.toIngredientId.toString(),
    toName: nameMap[s.toIngredientId.toString()] ?? "Unknown",
    impactNote: s.impactNote,
  }));
}

export async function createSubstitution(values: {
  fromIngredientId: string;
  toIngredientId: string;
  impactNote: string;
}) {
  const auth = await requireAdmin();
  if (!auth.success) return { success: false, error: auth.error };

  if (!Types.ObjectId.isValid(values.fromIngredientId) || !Types.ObjectId.isValid(values.toIngredientId)) {
    return { success: false, error: "Invalid ingredient IDs" };
  }
  if (!values.impactNote?.trim()) {
    return { success: false, error: "Impact note is required" };
  }
  if (values.fromIngredientId === values.toIngredientId) {
    return { success: false, error: "From and To ingredients must differ" };
  }

  try {
    await dbConnect();
    const sub = await IngredientSubstitution.create({
      fromIngredientId: new Types.ObjectId(values.fromIngredientId),
      toIngredientId: new Types.ObjectId(values.toIngredientId),
      impactNote: values.impactNote.trim(),
    });
    revalidatePath("/admin/substitutions");
    return { success: true, id: sub._id.toString() };
  } catch (err) {
    console.error("createSubstitution error:", err);
    return { success: false, error: "Failed to create substitution" };
  }
}

export async function updateSubstitution(
  id: string,
  values: { fromIngredientId: string; toIngredientId: string; impactNote: string },
) {
  const auth = await requireAdmin();
  if (!auth.success) return { success: false, error: auth.error };

  if (!Types.ObjectId.isValid(id)) return { success: false, error: "Invalid ID" };

  try {
    await dbConnect();
    const sub = await IngredientSubstitution.findByIdAndUpdate(
      id,
      {
        fromIngredientId: new Types.ObjectId(values.fromIngredientId),
        toIngredientId: new Types.ObjectId(values.toIngredientId),
        impactNote: values.impactNote.trim(),
      },
      { new: true, runValidators: true },
    );
    if (!sub) return { success: false, error: "Substitution not found" };
    revalidatePath("/admin/substitutions");
    return { success: true };
  } catch (err) {
    console.error("updateSubstitution error:", err);
    return { success: false, error: "Failed to update substitution" };
  }
}

export async function deleteSubstitution(id: string) {
  const auth = await requireAdmin();
  if (!auth.success) return { success: false, error: auth.error };

  if (!Types.ObjectId.isValid(id)) return { success: false, error: "Invalid ID" };

  try {
    await dbConnect();
    await IngredientSubstitution.findByIdAndDelete(id);
    revalidatePath("/admin/substitutions");
    return { success: true };
  } catch (err) {
    console.error("deleteSubstitution error:", err);
    return { success: false, error: "Failed to delete substitution" };
  }
}

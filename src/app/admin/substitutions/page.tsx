"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ManualDialog, ManualDeleteDialog } from "@/components/ManualDialog";
import { Badge } from "@/components/ui/badge";
import { MultiSelect } from "@/components/MultiSelect";
import { toast } from "sonner";
import {
  getAllSubstitutions,
  createSubstitution,
  updateSubstitution,
  deleteSubstitution,
  type SubstitutionRow,
} from "@/lib/actions/substitution.actions";
import { getAllIngredients } from "@/lib/actions/admin.actions";

interface IngredientOption {
  _id: string;
  canonicalName: string;
}

const emptyForm = { fromIngredientId: "", toIngredientIds: [] as string[], impactNote: "" };

export default function SubstitutionsPage() {
  const [subs, setSubs] = useState<SubstitutionRow[]>([]);
  const [ingredients, setIngredients] = useState<IngredientOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubstitutionRow | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllSubstitutions(), getAllIngredients()]).then(
      ([s, i]) => {
        setSubs(s);
        setIngredients(i);
        setLoading(false);
      },
    );
  }, []);

  const refresh = async () => {
    const s = await getAllSubstitutions();
    setSubs(s);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (row: SubstitutionRow) => {
    setEditing(row);
    setForm({
      fromIngredientId: row.fromIngredientId,
      toIngredientIds: [row.toIngredientId],
      impactNote: row.impactNote,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setFormError(null);
    setIsSaving(true);
    try {
      const [firstToIngredientId, ...additionalToIngredientIds] = form.toIngredientIds;
      const result = editing
        ? await updateSubstitution(editing._id, {
            fromIngredientId: form.fromIngredientId,
            toIngredientId: firstToIngredientId,
            impactNote: form.impactNote,
          })
        : await createSubstitution(form);

      if (!result.success) {
        setFormError((result as any).error ?? "Failed");
        return;
      }
      if (editing && additionalToIngredientIds.length > 0) {
        const addResult = await createSubstitution({
          fromIngredientId: form.fromIngredientId,
          toIngredientIds: additionalToIngredientIds,
          impactNote: form.impactNote,
        });
        if (!addResult.success) {
          setFormError((addResult as any).error ?? "Failed to add extra substitutes");
          return;
        }
      }
      toast.success(editing ? "Substitution updated" : "Substitution created");
      setDialogOpen(false);
      await refresh();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => setDeleteTarget(id);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const result = await deleteSubstitution(deleteTarget);
    if (!result.success) {
      toast.error((result as any).error ?? "Delete failed");
    } else {
      toast.success("Substitution deleted");
      await refresh();
    }
    setDeleteTarget(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-black font-outfit tracking-tight sm:text-3xl">
            Ingredient Swaps
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Define what can substitute for each ingredient and the impact it has.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full gap-2 sm:w-auto">
          <Plus className="h-4 w-4" />
          Add Swap
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mr-2" />
          Loading…
        </div>
      ) : subs.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-border/60 rounded-2xl text-muted-foreground">
          <p className="font-semibold">No substitutions yet.</p>
          <p className="text-sm mt-1">Click "Add Swap" to create the first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subs.map((row) => (
            <div
              key={row._id}
              className="flex flex-col gap-3 rounded-2xl border border-border/50 bg-card/60 px-4 py-3 glass sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="max-w-full shrink-0 rounded-lg text-xs font-bold"
                >
                  <span className="truncate">{row.fromName}</span>
                </Badge>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                <Badge
                  variant="secondary"
                  className="max-w-full shrink-0 rounded-lg text-xs font-bold"
                >
                  <span className="truncate">{row.toName}</span>
                </Badge>
              </div>
              <span className="min-w-0 flex-1 break-words text-sm text-muted-foreground sm:truncate">
                {row.impactNote}
              </span>
              <div className="flex shrink-0 justify-end gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg"
                  onClick={() => openEdit(row)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDelete(row._id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <ManualDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title={editing ? "Edit Swap" : "Add Swap"}
        className="max-w-md"
      >
        <div className="space-y-4">
          {formError && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {formError}
            </p>
          )}

          <div className="space-y-2">
            <Label>If you don't have…</Label>
            <Select
              value={form.fromIngredientId}
              onValueChange={(v) =>
                setForm((f) => ({
                  ...f,
                  fromIngredientId: v,
                  toIngredientIds: f.toIngredientIds.filter((id) => id !== v),
                }))
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Select ingredient" />
              </SelectTrigger>
              <SelectContent className="rounded-xl z-[200]">
                {ingredients.map((i) => (
                  <SelectItem key={i._id} value={i._id}>
                    {i.canonicalName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>You can use…</Label>
            <MultiSelect
              options={ingredients
                .filter((i) => i._id !== form.fromIngredientId)
                .map((i) => ({ label: i.canonicalName, value: i._id }))}
              selected={form.toIngredientIds}
              onChange={(selected) =>
                setForm((f) => ({ ...f, toIngredientIds: selected }))
              }
              placeholder="Select one or more substitutes"
              searchPlaceholder="Search substitutes..."
              emptyText="No substitute ingredients found."
            />
          </div>

          <div className="space-y-2">
            <Label>Impact / Note</Label>
            <Input
              placeholder="e.g. Slightly less creamy texture"
              value={form.impactNote}
              onChange={(e) =>
                setForm((f) => ({ ...f, impactNote: e.target.value }))
              }
              className="rounded-xl"
            />
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button
              variant="ghost"
              className="rounded-xl font-bold"
              onClick={() => setDialogOpen(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              className="rounded-xl font-bold"
              onClick={handleSave}
              disabled={
                isSaving ||
                !form.fromIngredientId ||
                form.toIngredientIds.length === 0 ||
                !form.impactNote.trim()
              }
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editing ? (
                "Save Changes"
              ) : (
                "Create Swap"
              )}
            </Button>
          </div>
        </div>
      </ManualDialog>

      {/* Delete confirm */}
      <ManualDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete Swap"
        description="This substitution will be removed globally and won't appear in any recipe's Swaps tab."
        onConfirm={confirmDelete}
      />
    </div>
  );
}

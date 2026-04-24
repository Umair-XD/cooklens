"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  createIngredient,
  updateIngredient,
  type IngredientFormValues,
} from "@/lib/actions/admin.actions";

const ingredientFormSchema = z.object({
  canonicalName: z.string().min(1, "Canonical name is required"),
  aliases: z.array(z.string()),
});

export type IngredientFormSchema = z.infer<typeof ingredientFormSchema>;

export interface IngredientFormProps {
  ingredient?: IngredientFormSchema & { _id?: string };
  onSuccess?: () => void;
  onCancel?: () => void;
}

const defaultValues: IngredientFormSchema = {
  canonicalName: "",
  aliases: [],
};

export function IngredientForm({
  ingredient,
  onSuccess,
  onCancel,
}: IngredientFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aliasInput, setAliasInput] = useState("");

  const form = useForm<IngredientFormSchema>({
    resolver: zodResolver(ingredientFormSchema),
    defaultValues: ingredient ?? defaultValues,
  });

  useEffect(() => {
    if (ingredient) {
      form.reset(ingredient);
    }
  }, [ingredient, form]);

  const addAlias = () => {
    const trimmed = aliasInput.trim();
    if (!trimmed) return;
    const existing = form.getValues("aliases");
    if (existing.includes(trimmed)) {
      setAliasInput("");
      return;
    }
    form.setValue("aliases", [...existing, trimmed]);
    setAliasInput("");
  };

  const removeAlias = (alias: string) => {
    const existing = form.getValues("aliases");
    form.setValue(
      "aliases",
      existing.filter((a) => a !== alias),
    );
  };

  const handleAliasKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addAlias();
    }
  };

  const onSubmit = async (values: IngredientFormSchema) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: IngredientFormValues = {
        canonicalName: values.canonicalName,
        aliases: values.aliases,
      };

      const result = ingredient?._id
        ? await updateIngredient(ingredient._id, payload)
        : await createIngredient(payload);

      if (!result.success) {
        const errs = (
          result as { errors?: { field: string; message: string }[] }
        )?.errors;
        if (errs && errs.length > 0) {
          errs.forEach((e) => {
            form.setError(e.field as keyof IngredientFormSchema, {
              message: e.message,
            });
          });
          setError(errs.map((e) => e.message).join(", "));
        } else {
          setError("Operation failed");
        }
        return;
      }

      form.reset(defaultValues);
      onSuccess?.();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-destructive/15 px-4 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <FormField
          control={form.control}
          name="canonicalName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canonical Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chicken Breast" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <Label>Aliases</Label>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="Type an alias and press Enter"
              value={aliasInput}
              onChange={(e) => setAliasInput(e.target.value)}
              onKeyDown={handleAliasKeyDown}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={addAlias}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {form.watch("aliases").map((alias) => (
              <Badge key={alias} variant="secondary" className="gap-1">
                {alias}
                <button
                  type="button"
                  onClick={() => removeAlias(alias)}
                  className="ml-1 hover:text-destructive"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
            {form.watch("aliases").length === 0 && (
              <span className="text-sm text-muted-foreground">
                No aliases added
              </span>
            )}
          </div>
          <FormField
            control={form.control}
            name="aliases"
            render={() => (
              <FormItem>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? "Saving..."
              : ingredient
                ? "Update Ingredient"
                : "Create Ingredient"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

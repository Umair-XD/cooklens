"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  PaginationState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Pencil, Trash2, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManualDialog, ManualDeleteDialog } from "@/components/ManualDialog";
import { RecipeForm, type RecipeFormProps } from "@/components/RecipeForm";
import { deleteRecipe } from "@/lib/actions/admin.actions";

export interface RecipeRecord {
  _id: string;
  name: string;
  cuisineType: string;
  difficulty: string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
}

interface RecipeManagerProps {
  recipes: RecipeRecord[];
  ingredientOptions: { _id: string; canonicalName: string }[];
}

export function RecipeManager({
  recipes,
  ingredientOptions,
}: RecipeManagerProps) {
  const router = useRouter();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  // Manual dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRecipe, setEditRecipe] = useState<RecipeRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteRecipeItem, setDeleteRecipeItem] = useState<RecipeRecord | null>(null);

  const handleEditClick = (recipe: RecipeRecord) => {
    setEditRecipe(recipe);
    setEditOpen(true);
  };

  const handleDeleteClick = (recipe: RecipeRecord) => {
    setDeleteRecipeItem(recipe);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteRecipeItem) return;
    try {
      await deleteRecipe(deleteRecipeItem._id);
      router.refresh();
      setDeleteOpen(false);
      setDeleteRecipeItem(null);
    } catch (error) {
      console.error(error);
    }
  };

  const columns = useMemo<ColumnDef<RecipeRecord>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold p-0 hover:bg-transparent"
        >
          Name
        </Button>
      ),
      cell: ({ row }) => <span className="font-bold">{row.original.name}</span>,
    },
    {
      accessorKey: "cuisineType",
      header: "Cuisine",
      cell: ({ row }) => <span className="text-[10px] uppercase tracking-wider font-black px-2.5 py-1 rounded-lg bg-primary/5 text-primary border border-primary/10">{row.original.cuisineType}</span>,
    },
    {
      accessorKey: "difficulty",
      header: "Difficulty",
      cell: ({ row }) => (
        <span className="capitalize text-[10px] font-black text-muted-foreground/60 tracking-widest uppercase">
          {row.original.difficulty.toLowerCase()}
        </span>
      ),
    },
    {
      accessorKey: "prepTimeMinutes",
      header: "Prep",
      cell: ({ row }) => <span className="text-xs text-muted-foreground font-medium">{row.original.prepTimeMinutes}m</span>,
    },
    {
      accessorKey: "cookTimeMinutes",
      header: "Cook",
      cell: ({ row }) => <span className="text-xs text-muted-foreground font-medium">{row.original.cookTimeMinutes}m</span>,
    },
    {
      accessorKey: "servings",
      header: "Servings",
      cell: ({ row }) => <span className="text-xs text-muted-foreground font-medium">{row.original.servings}p</span>,
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4 text-[10px] uppercase tracking-widest font-black text-muted-foreground/60">Actions</div>,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1 pr-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary transition-all active:scale-95"
            onClick={() => handleEditClick(row.original)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-all active:scale-95"
            onClick={() => handleDeleteClick(row.original)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ], [ingredientOptions]);

  const table = useReactTable({
    data: recipes,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    state: {
      sorting,
      columnFilters,
      pagination,
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-sm group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search recipes..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="bg-muted/30 border-border/50 focus:bg-background transition-all pl-9 pr-4 rounded-xl h-11"
          />
        </div>
        
        <Button 
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto h-11 rounded-xl shadow-premium hover:shadow-premium-hover transition-all font-bold gap-2 px-6"
        >
          <Plus className="w-5 h-5" /> Add Recipe
        </Button>
      </div>

      <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-muted/30">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent border-border/50">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-14 px-6 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/50">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="border-border/50 hover:bg-primary/[0.01] transition-colors group h-16">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-6 py-0">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-muted-foreground font-medium"
                >
                  No recipes found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-2">
        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">
          Showing {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} Pages
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded-lg font-black text-[10px] uppercase tracking-widest h-9 px-4 hover:bg-primary/5 hover:text-primary transition-all"
          >
            Prev
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded-lg font-black text-[10px] uppercase tracking-widest h-9 px-4 hover:bg-primary/5 hover:text-primary transition-all"
          >
            Next
          </Button>
        </div>
      </div>

      {/* MANUAL Create Dialog */}
      <ManualDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        title="Create Recipe"
        className="max-w-3xl"
      >
        <RecipeForm
          ingredientOptions={ingredientOptions}
          onSuccess={() => {
            setCreateOpen(false);
            router.refresh();
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </ManualDialog>

      {/* MANUAL Edit Dialog */}
      <ManualDialog 
        open={editOpen} 
        onOpenChange={setEditOpen} 
        title="Edit Recipe"
        className="max-w-3xl"
      >
        {editRecipe && (
          <RecipeForm
            recipe={editRecipe as any}
            ingredientOptions={ingredientOptions}
            onSuccess={() => {
              setEditOpen(false);
              router.refresh();
            }}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </ManualDialog>

      {/* MANUAL Delete Dialog */}
      <ManualDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Recipe"
        description="Are you sure you want to delete this recipe? This action cannot be undone."
        itemName={deleteRecipeItem?.name || ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}

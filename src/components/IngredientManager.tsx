"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ManualDialog, ManualDeleteDialog } from "@/components/ManualDialog";
import {
  IngredientForm,
  type IngredientFormProps,
} from "@/components/IngredientForm";
import { deleteIngredient } from "@/lib/actions/admin.actions";

export interface IngredientRecord {
  _id: string;
  canonicalName: string;
  aliases: string[];
}

interface IngredientManagerProps {
  ingredients: IngredientRecord[];
}

export function IngredientManager({
  ingredients,
}: IngredientManagerProps) {
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
  const [editIngredient, setEditIngredient] = useState<IngredientRecord | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteIngredientItem, setDeleteIngredientItem] = useState<IngredientRecord | null>(null);

  // Handlers
  const handleEditClick = (ingredient: IngredientRecord) => {
    setEditIngredient(ingredient);
    setEditOpen(true);
  };

  const handleDeleteClick = (ingredient: IngredientRecord) => {
    setDeleteIngredientItem(ingredient);
    setDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteIngredientItem) return;
    try {
      await deleteIngredient(deleteIngredientItem._id);
      router.refresh();
      setDeleteOpen(false);
      setDeleteIngredientItem(null);
    } catch (error) {
      console.error(error);
    }
  };

  const columns: ColumnDef<IngredientRecord>[] = [
    {
      accessorKey: "canonicalName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="font-bold p-0 hover:bg-transparent"
        >
          Canonical Name
        </Button>
      ),
    },
    {
      accessorKey: "aliases",
      header: "Aliases",
      cell: ({ row }) => {
        const aliases = row.getValue("aliases") as string[];
        if (!aliases || aliases.length === 0) {
          return <span className="text-sm text-muted-foreground italic opacity-50 text-xs">No aliases</span>;
        }
        return (
          <div className="flex flex-wrap gap-1">
            {aliases.map((alias) => (
              <Badge key={alias} variant="secondary" className="text-[10px] font-medium px-2 py-0 border-primary/10">
                {alias}
              </Badge>
            ))}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right pr-4 text-xs font-black uppercase tracking-widest text-muted-foreground/60">Actions</div>,
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
  ];

  const table = useReactTable({
    data: ingredients,
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
            placeholder="Search ingredients..."
            value={
              (table.getColumn("canonicalName")?.getFilterValue() as string) ?? ""
            }
            onChange={(event) =>
              table.getColumn("canonicalName")?.setFilterValue(event.target.value)
            }
            className="bg-muted/30 border-border/50 focus:bg-background transition-all pl-9 pr-4 rounded-xl h-11"
          />
        </div>
        
        <Button 
          onClick={() => setCreateOpen(true)}
          className="w-full sm:w-auto h-11 rounded-xl shadow-premium hover:shadow-premium-hover transition-all font-bold gap-2 px-6"
        >
          <Plus className="w-5 h-5" /> Add Ingredient
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
                  No ingredients found.
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
        title="Create Ingredient"
      >
        <IngredientForm
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
        title="Edit Ingredient"
      >
        {editIngredient && (
          <IngredientForm
            ingredient={editIngredient as any}
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
        title="Delete Ingredient"
        description="Are you sure you want to delete this ingredient? This action cannot be undone."
        itemName={deleteIngredientItem?.canonicalName || ""}
        onConfirm={handleDelete}
      />
    </div>
  );
}

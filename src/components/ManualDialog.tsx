"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ManualDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ManualDialog({
  open,
  onOpenChange,
  title,
  children,
  className,
}: ManualDialogProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Prevent scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Content */}
      <div 
        ref={contentRef}
        className={cn(
          "relative w-full max-w-lg bg-background rounded-3xl shadow-2xl border border-border/50 flex flex-col overflow-hidden animate-in zoom-in-95 fade-in duration-300",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <h2 className="text-2xl font-black tracking-tighter font-outfit">{title}</h2>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-muted"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
}

interface ManualDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  itemName?: string;
  onConfirm: () => Promise<void> | void;
}

export function ManualDeleteDialog({
  open,
  onOpenChange,
  title = "Delete Confirmation",
  description = "This action cannot be undone. This will permanently delete the item.",
  itemName,
  onConfirm,
}: ManualDeleteDialogProps) {
  const [isDeleting, setIsDeleting] = (require("react").useState)(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ManualDialog open={open} onOpenChange={onOpenChange} title={title} className="max-w-md">
      <div className="space-y-4">
        <div className="text-muted-foreground font-medium">
          {description}
          {itemName && (
            <div className="mt-2 p-3 rounded-xl bg-destructive/5 border border-destructive/10 text-destructive font-bold">
              Item: {itemName}
            </div>
          )}
        </div>
        
        <div className="flex gap-3 justify-end pt-2">
          <Button 
            variant="ghost" 
            onClick={() => onOpenChange(false)} 
            disabled={isDeleting}
            className="font-bold rounded-xl"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleConfirm} 
            disabled={isDeleting}
            className="font-bold rounded-xl shadow-lg shadow-destructive/20"
          >
            {isDeleting ? "Deleting..." : "Delete Item"}
          </Button>
        </div>
      </div>
    </ManualDialog>
  );
}

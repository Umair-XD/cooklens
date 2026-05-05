"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  folder?: string;
  className?: string;
  /** Render as a circular avatar picker instead of a rectangle */
  variant?: "avatar" | "cover";
  label?: string;
}

export function ImageUploader({
  value,
  onChange,
  folder = "cooklens",
  className,
  variant = "cover",
  label,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return;
      }
      onChange(data.url);
      toast.success("Image uploaded");
    } catch {
      toast.error("Upload failed — please try again");
    } finally {
      setUploading(false);
    }
  };

  const isAvatar = variant === "avatar";

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}

      <div className={cn("relative", isAvatar ? "h-24 w-24" : "w-full")}>
        <div
          className={cn(
            "group relative overflow-hidden border-2 border-dashed border-border/60 bg-muted/20 transition-colors hover:border-primary/40 hover:bg-muted/40 cursor-pointer",
            isAvatar ? "h-24 w-24 rounded-full" : "h-44 w-full rounded-2xl",
            uploading && "pointer-events-none opacity-60",
          )}
          onClick={() => inputRef.current?.click()}
        >
          {value ? (
            <>
              <img src={value} alt="Uploaded" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-white" />
                    {!isAvatar && (
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Change</span>
                    )}
                  </>
                )}
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground/50">
              {uploading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-6 w-6" />
                  {!isAvatar && (
                    <span className="text-[11px] font-bold uppercase tracking-wider">Click to upload</span>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Remove button */}
        {value && !uploading && (
          <button
            type="button"
            aria-label="Remove image"
            onClick={(e) => { e.stopPropagation(); onChange(""); }}
            className={cn(
              "absolute z-10 flex items-center justify-center rounded-full bg-destructive text-white shadow-md transition-colors hover:bg-destructive/90",
              isAvatar ? "top-0 right-0 h-6 w-6" : "right-3 top-3 h-8 w-8",
            )}
          >
            <X className={cn(isAvatar ? "h-3.5 w-3.5" : "h-4 w-4")} />
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

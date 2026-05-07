"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ImagePlus, Loader2, Minus, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
  const [mounted, setMounted] = useState(false);
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [imageEl, setImageEl] = useState<HTMLImageElement | null>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const isAvatar = variant === "avatar";
  const aspectRatio = isAvatar ? 1 : 16 / 9;
  const cropWidth = isAvatar ? 512 : 1280;
  const cropHeight = isAvatar ? 512 : 720;

  const frameStyle = useMemo(
    () => ({ aspectRatio: `${aspectRatio}` }),
    [aspectRatio],
  );
  const frameWidth = 320;
  const frameHeight = frameWidth / aspectRatio;
  const previewWidth = imageEl
    ? imageEl.naturalWidth *
      Math.max(frameWidth / imageEl.naturalWidth, frameHeight / imageEl.naturalHeight) *
      zoom
    : frameWidth * zoom;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!sourceUrl) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [sourceUrl]);

  useEffect(() => {
    return () => {
      if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceUrl]);

  const resetCrop = () => {
    setImageEl(null);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceUrl("");
    setSourceFile(null);
  };

  const openCropper = (file: File) => {
    if (!file) return;
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
    setSourceFile(file);
    setSourceUrl(URL.createObjectURL(file));
    setImageEl(null);
    setPosition({ x: 0, y: 0 });
    setZoom(1);
  };

  const createCroppedFile = async () => {
    if (!sourceFile || !imageEl) return null;

    const canvas = document.createElement("canvas");
    canvas.width = cropWidth;
    canvas.height = cropHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const baseScale = Math.max(
      frameWidth / imageEl.naturalWidth,
      frameHeight / imageEl.naturalHeight,
    );
    const displayWidth = imageEl.naturalWidth * baseScale * zoom;
    const displayHeight = imageEl.naturalHeight * baseScale * zoom;
    const displayX = (frameWidth - displayWidth) / 2 + position.x;
    const displayY = (frameHeight - displayHeight) / 2 + position.y;

    const scaleX = cropWidth / frameWidth;
    const scaleY = cropHeight / frameHeight;

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, cropWidth, cropHeight);
    ctx.drawImage(
      imageEl,
      displayX * scaleX,
      displayY * scaleY,
      displayWidth * scaleX,
      displayHeight * scaleY,
    );

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.92),
    );
    if (!blob) return null;

    const name = sourceFile.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${name}-cropped.webp`, { type: "image/webp" });
  };

  const uploadFile = async (file: File) => {
    if (!file) return false;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", folder);

      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error ?? "Upload failed");
        return false;
      }
      onChange(data.url);
      toast.success("Image uploaded");
      return true;
    } catch {
      toast.error("Upload failed — please try again");
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleCropAndUpload = async () => {
    const cropped = await createCroppedFile();
    if (!cropped) {
      toast.error("Could not crop image");
      return;
    }
    const uploaded = await uploadFile(cropped);
    if (uploaded) resetCrop();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {label && (
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      )}

      <div className={cn("relative", isAvatar ? "h-24 w-24" : "w-full")}>
        <div
          className={cn(
            "group relative overflow-hidden border-2 border-dashed border-border/60 bg-muted/20 transition-colors hover:border-primary/40 hover:bg-muted/40 cursor-pointer",
            isAvatar ? "h-24 w-24 rounded-full" : "h-44 w-full rounded-xl",
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

      {mounted && sourceUrl && createPortal(
        <div className="fixed inset-0 z-[220] flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center sm:p-6">
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-border/50 bg-background shadow-2xl">
            <div className="flex items-center justify-between border-b border-border/50 p-4 sm:p-5">
              <div>
                <h2 className="font-outfit text-xl font-black tracking-tighter">
                  Position image
                </h2>
                <p className="text-xs font-medium text-muted-foreground">
                  {isAvatar ? "Square avatar frame" : "16:9 recipe frame"} · drag to reposition, zoom to crop.
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-lg"
                onClick={resetCrop}
                disabled={uploading}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4 p-4 sm:p-5">
              <div className="rounded-xl bg-muted/30 p-3 sm:p-4">
                <div
                  className={cn(
                    "relative mx-auto w-full max-w-[320px] cursor-grab touch-none overflow-hidden border border-border/60 bg-muted active:cursor-grabbing",
                    isAvatar ? "rounded-full" : "rounded-xl",
                  )}
                  style={frameStyle}
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    dragRef.current = {
                      pointerId: e.pointerId,
                      startX: e.clientX,
                      startY: e.clientY,
                      originX: position.x,
                      originY: position.y,
                    };
                  }}
                  onPointerMove={(e) => {
                    const drag = dragRef.current;
                    if (!drag || drag.pointerId !== e.pointerId) return;
                    setPosition({
                      x: drag.originX + e.clientX - drag.startX,
                      y: drag.originY + e.clientY - drag.startY,
                    });
                  }}
                  onPointerUp={() => {
                    dragRef.current = null;
                  }}
                  onPointerCancel={() => {
                    dragRef.current = null;
                  }}
                >
                  <img
                    src={sourceUrl}
                    alt="Crop preview"
                    draggable={false}
                    onLoad={(e) => setImageEl(e.currentTarget)}
                    className="absolute left-1/2 top-1/2 max-w-none select-none"
                    style={{
                      width: `${previewWidth}px`,
                      transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 ring-2 ring-primary/70 ring-inset" />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Minus className="h-4 w-4 text-muted-foreground" />
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <Plus className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  className="rounded-xl"
                  onClick={resetCrop}
                  disabled={uploading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="rounded-xl"
                  onClick={handleCropAndUpload}
                  disabled={uploading}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload Image"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) openCropper(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

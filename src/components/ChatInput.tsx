"use client";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Send,
  Square,
  X,
  Camera,
  ImageIcon,
} from "lucide-react";
import {
  useRef,
  useEffect,
  useState,
  memo,
  type FormEvent,
  type ChangeEvent,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";

interface ChatInputProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (e: FormEvent, attachments?: FileList) => void;
  isStreaming: boolean;
  onStop?: () => Promise<void>;
  className?: string;
  placeholder?: string;
}

async function isNativePlatform(): Promise<boolean> {
  try {
    const { Capacitor } = await import("@capacitor/core");
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

const ChatInput = memo(
  ({
    input,
    onInputChange,
    onSubmit,
    isStreaming,
    onStop,
    className,
    placeholder = "Ask anything about cooking...",
  }: ChatInputProps) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [native, setNative] = useState(false);

    useEffect(() => {
      isNativePlatform().then(setNative);
    }, []);

    const addFiles = (files: File[]) => {
      if (files.length === 0) return;
      setSelectedFiles((prev) => [...prev, ...files]);
      setPreviewUrls((prev) => [
        ...prev,
        ...files.map((f) => URL.createObjectURL(f)),
      ]);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if ((input.trim() || selectedFiles.length > 0) && !isStreaming) {
          submitMessage(e as unknown as React.FormEvent);
        }
      }
    };

    const handleGalleryClick = () => {
      if (native) {
        openNativeMedia("photos");
      } else {
        galleryInputRef.current?.click();
      }
    };

    const handleCameraClick = () => {
      if (native) {
        openNativeMedia("camera");
      } else {
        cameraInputRef.current?.click();
      }
    };

    const openNativeMedia = async (source: "camera" | "photos") => {
      try {
        const { Camera, CameraResultType, CameraSource } = await import(
          "@capacitor/camera"
        );
        const image = await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType: CameraResultType.DataUrl,
          source:
            source === "camera" ? CameraSource.Camera : CameraSource.Photos,
        });
        if (!image.dataUrl) return;

        const res = await fetch(image.dataUrl);
        const blob = await res.blob();
        const file = new File(
          [blob],
          source === "camera" ? "photo.jpg" : "image.jpg",
          { type: blob.type || "image/jpeg" },
        );
        addFiles([file]);
      } catch (err) {
        console.error("Media error:", err);
      }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      addFiles(Array.from(e.target.files || []));
      if (e.target) e.target.value = "";
    };

    const removeFile = (index: number) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => {
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
    };

    const submitMessage = (e: FormEvent) => {
      e.preventDefault();
      if (!isStreaming && (input.trim() || selectedFiles.length > 0)) {
        const dt = new DataTransfer();
        selectedFiles.forEach((f) => dt.items.add(f));

        onSubmit(e, dt.files);

        setSelectedFiles([]);
        previewUrls.forEach(URL.revokeObjectURL);
        setPreviewUrls([]);

        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
        }
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf("image") !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }
      if (files.length > 0) addFiles(files);
    };

    // Auto-resize textarea
    useEffect(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
      }
    }, [input]);

    return (
      <div
        className={cn(
          "relative w-full max-w-4xl mx-auto px-3 bg-transparent sm:px-4",
          className,
        )}
      >
        <div className="relative flex flex-col w-full bg-card border border-border/50 rounded-lg ring-offset-background focus-within:border-primary/40 overflow-hidden">
          {/* File Previews */}
          {previewUrls.length > 0 && (
            <div className="flex gap-3 px-4 pt-4 overflow-x-auto no-scrollbar scroll-smooth">
              {previewUrls.map((url, i) => (
                <div
                  key={i}
                  className="relative group shrink-0 animate-in fade-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-border/50 shadow-sm ring-2 ring-transparent transition-all">
                    <img
                      src={url}
                      alt="Preview"
                      className="h-full w-full object-cover transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  </div>
                  <button
                    onClick={() => removeFile(i)}
                    className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-all z-20 focus:outline-hidden"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-1.5 p-1.5 focus-within:outline-hidden sm:gap-2 sm:p-2">
            {/* Hidden inputs for web fallback */}
            <input
              type="file"
              ref={galleryInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              multiple
            />
            <input
              type="file"
              ref={cameraInputRef}
              className="hidden"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
            />

            {/* Gallery button */}
            <Button
              type="button"
              variant={null as any}
              size="icon"
              onClick={handleGalleryClick}
              className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent sm:h-10 sm:w-10 sm:rounded-xl"
              title="Attach image"
            >
              <ImageIcon className="h-4 w-4 text-muted-foreground/70 sm:h-5 sm:w-5" />
            </Button>

            {/* Camera button */}
            <Button
              type="button"
              variant={null as any}
              size="icon"
              onClick={handleCameraClick}
              className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted/80 flex items-center justify-center transition-colors focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent sm:h-10 sm:w-10 sm:rounded-xl"
              title="Take photo"
            >
              <Camera className="h-4 w-4 text-muted-foreground/70 sm:h-5 sm:w-5" />
            </Button>

            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder={placeholder}
              className="min-h-10 max-h-32 w-full resize-none bg-transparent border-none focus-visible:ring-0 px-1 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/40 transition-all font-medium sm:min-h-[44px] sm:max-h-[200px] sm:px-2 sm:py-3 sm:text-base"
              rows={1}
              disabled={isStreaming}
            />

            <div className="flex items-center shrink-0">
              {isStreaming ? (
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={onStop}
                  className="h-9 w-9 shrink-0 rounded-lg flex items-center justify-center focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-10 sm:w-10 sm:rounded-xl"
                >
                  <Square className="h-4 w-4 fill-current text-white" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim() && selectedFiles.length === 0}
                  onClick={submitMessage}
                  className={cn(
                    "h-9 w-9 shrink-0 rounded-lg flex items-center justify-center focus-visible:ring-0 focus-visible:ring-offset-0 sm:h-10 sm:w-10 sm:rounded-xl",
                    !input.trim() && selectedFiles.length === 0
                      ? "bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                      : "bg-primary text-primary-foreground",
                  )}
                >
                  <Send className="h-4 w-4 transition-transform" />
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="mt-1 text-center pb-0 sm:mt-2 sm:pb-2">
          <p className="text-[11px] text-muted-foreground/50 font-medium tracking-tight">
            ChefLens AI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    );
  },
);

ChatInput.displayName = "ChatInput";
export default ChatInput;

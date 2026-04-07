"use client";

import { useState, useRef, useCallback } from "react";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Capacitor } from "@capacitor/core";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera as CameraIcon, Upload, X } from "lucide-react";

interface CameraCaptureProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (imageDataUrl: string) => void;
}

function isNativePlatform(): boolean {
  try {
    return Capacitor.isNativePlatform();
  } catch {
    return false;
  }
}

async function checkCameraPermission(): Promise<
  "granted" | "denied" | "prompt"
> {
  try {
    const { Camera } = await import("@capacitor/camera");
    const status = await Camera.checkPermissions();
    return status.camera as "granted" | "denied" | "prompt";
  } catch {
    return "prompt";
  }
}

async function requestCameraPermission(): Promise<boolean> {
  try {
    const { Camera } = await import("@capacitor/camera");
    const status = await Camera.requestPermissions();
    return status.camera === "granted";
  } catch {
    return false;
  }
}

async function captureWithCapacitor(): Promise<string | null> {
  const permission = await checkCameraPermission();

  if (permission === "denied") {
    const granted = await requestCameraPermission();
    if (!granted) return null;
  }

  try {
    const { Camera } = await import("@capacitor/camera");
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    return image.dataUrl ?? null;
  } catch (error) {
    console.error("Camera capture failed:", error);
    return null;
  }
}

export default function CameraCapture({
  open,
  onOpenChange,
  onCapture,
}: CameraCaptureProps) {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nativeRef = useRef(false);

  const handleNativeCapture = useCallback(async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const imageDataUrl = await captureWithCapacitor();

      if (!imageDataUrl) {
        setError(
          "Failed to capture image. Please try again or grant camera permissions.",
        );
        return;
      }

      setCapturedImage(imageDataUrl);
    } catch {
      setError("An unexpected error occurred while capturing.");
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file.");
        return;
      }

      setIsProcessing(true);
      setError(null);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setCapturedImage(result);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setError("Failed to read the selected image.");
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      setCapturedImage(null);
      onOpenChange(false);
    }
  }, [capturedImage, onCapture, onOpenChange]);

  const handleReset = useCallback(() => {
    setCapturedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  const handleClose = useCallback(() => {
    handleReset();
    onOpenChange(false);
  }, [handleReset, onOpenChange]);

  const isNative = isNativePlatform();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Capture Image</DialogTitle>
          <DialogDescription>
            Take a photo of your ingredients or upload one.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 py-4">
          {error && (
            <div className="w-full rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {capturedImage ? (
            <div className="flex w-full flex-col items-center gap-4">
              <img
                src={capturedImage}
                alt="Captured"
                className="max-h-64 w-full rounded-md object-cover"
              />
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleReset}>
                  <X className="mr-2 h-4 w-4" />
                  Retake
                </Button>
                <Button onClick={handleConfirm}>Confirm</Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {isNative ? (
                <Button
                  onClick={handleNativeCapture}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  <CameraIcon className="h-5 w-5" />
                  {isProcessing ? "Capturing..." : "Take Photo"}
                </Button>
              ) : (
                <>
                  <Button
                    onClick={async () => {
                      // On web, also try Capacitor if available (PWA mode)
                      nativeRef.current = true;
                      await handleNativeCapture();
                    }}
                    variant="outline"
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <CameraIcon className="h-5 w-5" />
                    {isProcessing ? "Capturing..." : "Use Camera"}
                  </Button>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="gap-2"
                  >
                    <Upload className="h-5 w-5" />
                    Upload Image
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

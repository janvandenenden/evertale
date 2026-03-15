"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { validatePhotoFile } from "@/lib/validators/photo";

interface PhotoUploadProps {
  onFileSelected: (file: File) => void;
  onClear: () => void;
  selectedFile: File | null;
  previewUrl: string | null;
  disabled?: boolean;
}

export function PhotoUpload({
  onFileSelected,
  onClear,
  selectedFile,
  previewUrl,
  disabled = false,
}: PhotoUploadProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setError(null);
      const file = acceptedFiles[0];
      if (!file) return;

      const validation = validatePhotoFile(file);
      if (!validation.valid) {
        setError(validation.error ?? "Invalid file");
        return;
      }

      onFileSelected(file);
    },
    [onFileSelected]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    maxFiles: 1,
    disabled,
  });

  if (selectedFile && previewUrl) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border/60 bg-warm/30">
        <img
          src={previewUrl}
          alt="Selected photo preview"
          className="mx-auto max-h-80 object-contain p-4"
        />
        <div className="flex items-center justify-between border-t border-border/60 bg-background/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ImageIcon className="size-4" />
            <span className="truncate max-w-[200px]">{selectedFile.name}</span>
            <span>({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onClear}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
          isDragActive
            ? "border-warm-accent/50 bg-warm-accent/5"
            : "border-border hover:border-warm-accent/30 hover:bg-warm/30"
        } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
      >
        <input {...getInputProps()} />
        <Upload className="size-8 text-muted-foreground/60" />
        <div>
          <p className="text-sm font-medium">
            {isDragActive ? "Drop your photo here" : "Drag a photo here, or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            JPEG, PNG, or WebP. Max 10MB.
          </p>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

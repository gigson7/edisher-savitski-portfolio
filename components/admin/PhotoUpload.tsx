"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { uploadPhoto } from "@/app/(admin)/admin/photos/actions";

interface Props {
  onUploadComplete?: () => void;
}

export function PhotoUpload({ onUploadComplete }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  async function uploadFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    setIsUploading(true);
    setErrors([]);
    const newErrors: string[] = [];

    for (const file of fileArray) {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadPhoto(formData);
      if (result.error) {
        newErrors.push(`${file.name}: ${result.error}`);
      }
    }

    setIsUploading(false);
    if (newErrors.length > 0) {
      setErrors(newErrors);
    }
    if (newErrors.length < fileArray.length) {
      // At least one succeeded
      onUploadComplete?.();
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      // Reset so the same file can be re-uploaded after deletion
      e.target.value = "";
    }
  }

  return (
    <div className="mb-6">
      <div
        role="button"
        tabIndex={0}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !isUploading) {
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer"
        style={{
          borderColor: isDragOver ? "#8d7336" : "#d4c5a0",
          backgroundColor: isDragOver
            ? "rgba(141, 115, 54, 0.05)"
            : "white",
        }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: "rgba(141, 115, 54, 0.1)" }}
        >
          <Upload className="w-6 h-6" style={{ color: "#8d7336" }} />
        </div>

        {isUploading ? (
          <p className="text-sm font-medium text-neutral-600">
            Uploading and processing...
          </p>
        ) : (
          <>
            <p className="text-sm font-medium text-neutral-700">
              Drag &amp; drop photos here, or click to select
            </p>
            <p className="text-xs text-neutral-400">
              JPEG, PNG, WebP, AVIF — max 10 MB each — multiple files supported
            </p>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleInputChange}
          disabled={isUploading}
        />
      </div>

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1">
          {errors.map((err, i) => (
            <li key={i} className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {err}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

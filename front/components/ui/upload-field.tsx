"use client";

import { useRef, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { upload as clientUpload } from "@vercel/blob/client";

export function UploadField({
  id,
  label,
  value,
  onChange,
  accept = "image/*",
  placeholder,
}: {
  id: string;
  label?: string;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  placeholder?: string;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onFileChosen = async (file?: File | null) => {
    if (!file) return;
    try {
      setUploading(true);
      const res = await clientUpload(`admin/${Date.now()}-${file.name}`, file, {
        access: "public",
        handleUploadUrl: "/api/blob/upload-url",
      });
      onChange(res.url);
    } catch (e) {
      // silent; caller can validate value
      console.error("Upload failed", e);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onFileChosen(e.target.files?.[0] || null)}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-1" /> {uploading ? "Yükleniyor" : "Yükle"}
        </Button>
      </div>
      {value && accept.startsWith("image/") && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt="preview"
          className="w-20 h-20 rounded object-cover border"
        />
      )}
    </div>
  );
}


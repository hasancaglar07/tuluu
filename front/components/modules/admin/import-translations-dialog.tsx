"use client";

import type React from "react";

import { useState } from "react";
import { Upload, X, Check, AlertCircle, FileJson } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";

// Mock data for demonstration
const MOCK_LANGUAGES = [
  { code: "en", name: "English", isDefault: true },
  { code: "es", name: "Spanish", isDefault: false },
  { code: "fr", name: "French", isDefault: false },
  { code: "de", name: "German", isDefault: false },
  { code: "it", name: "Italian", isDefault: false },
  { code: "ja", name: "Japanese", isDefault: false },
];

interface ImportTranslationsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTranslationsDialog({
  open,
  onOpenChange,
}: ImportTranslationsDialogProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "validating" | "success" | "error"
  >("idle");
  const [fileName, setFileName] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [validationResults, setValidationResults] = useState<{
    totalKeys: number;
    newKeys: number;
    updatedKeys: number;
    invalidKeys: number;
  } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/json") {
      setErrorMessage("Only JSON files are supported.");
      setUploadState("error");
      return;
    }

    setFileName(file.name);
    setErrorMessage("");
    setUploadState("idle");
  };

  const handleUpload = () => {
    if (!selectedLanguage) {
      setErrorMessage("Please select a language.");
      return;
    }

    if (!fileName) {
      setErrorMessage("Please select a file.");
      return;
    }

    setUploadState("uploading");
    setUploadProgress(0);

    // Simulate file upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadState("validating");

          // Simulate validation
          setTimeout(() => {
            setValidationResults({
              totalKeys: 124,
              newKeys: 15,
              updatedKeys: 87,
              invalidKeys: 3,
            });
            setUploadState("success");
          }, 1500);

          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleConfirm = () => {
    // In a real implementation, this would apply the changes to the database
    toast("Translations imported", {
      description: `Successfully imported ${
        validationResults?.totalKeys
      } translations for ${
        MOCK_LANGUAGES.find((l) => l.code === selectedLanguage)?.name
      }.`,
    });

    // Reset state
    setSelectedLanguage("");
    setFileName("");
    setUploadProgress(0);
    setUploadState("idle");
    setValidationResults(null);

    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset state
    setSelectedLanguage("");
    setFileName("");
    setUploadProgress(0);
    setUploadState("idle");
    setValidationResults(null);
    setErrorMessage("");

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import Translations</DialogTitle>
          <DialogDescription>
            Upload a JSON file containing translations for a specific language.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {errorMessage && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Select Language</label>
              <Select
                value={selectedLanguage}
                onValueChange={setSelectedLanguage}
                disabled={
                  uploadState === "uploading" || uploadState === "validating"
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_LANGUAGES.map((language) => (
                    <SelectItem key={language.code} value={language.code}>
                      {language.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                The language these translations are for
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Upload JSON File</label>
              <div className="mt-2">
                {fileName ? (
                  <div className="flex items-center justify-between p-2 border rounded-md">
                    <div className="flex items-center">
                      <FileJson className="h-5 w-5 mr-2 text-blue-500" />
                      <span className="text-sm">{fileName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFileName("");
                        setUploadState("idle");
                      }}
                      disabled={
                        uploadState === "uploading" ||
                        uploadState === "validating"
                      }
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed rounded-md p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium">
                      Drag and drop or click to upload
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Only JSON files are supported
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleFileChange}
                      disabled={
                        uploadState === "uploading" ||
                        uploadState === "validating"
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {(uploadState === "uploading" || uploadState === "validating") && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">
                    {uploadState === "uploading"
                      ? "Uploading..."
                      : "Validating..."}
                  </span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {uploadState === "success" && validationResults && (
              <Alert>
                <Check className="h-4 w-4" />
                <AlertTitle>Validation Complete</AlertTitle>
                <AlertDescription>
                  <p className="mt-2">
                    Found {validationResults.totalKeys} translation keys:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li className="text-sm">
                      {validationResults.newKeys} new keys
                    </li>
                    <li className="text-sm">
                      {validationResults.updatedKeys} updated keys
                    </li>
                    {validationResults.invalidKeys > 0 && (
                      <li className="text-sm text-amber-600">
                        {validationResults.invalidKeys} invalid keys (will be
                        skipped)
                      </li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {uploadState === "success" ? (
            <Button onClick={handleConfirm}>Confirm Import</Button>
          ) : (
            <Button
              onClick={handleUpload}
              disabled={
                !fileName ||
                !selectedLanguage ||
                uploadState === "uploading" ||
                uploadState === "validating"
              }
            >
              {uploadState === "uploading"
                ? "Uploading..."
                : uploadState === "validating"
                ? "Validating..."
                : "Upload & Validate"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

"use client";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"];
const AUDIO_EXTENSIONS = [".mp3", ".wav", ".ogg", ".aac", ".m4a"];
const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"];

export type MediaKind = "image" | "audio" | "video";

const stripUrl = (value: string) => value.split("?")[0].split("#")[0].toLowerCase();

export const isLikelyUrl = (value?: string | null) => {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:");
};

export const detectMediaKind = (value?: string | null): MediaKind | null => {
  if (!isLikelyUrl(value)) return null;
  const normalized = (value ?? "").toLowerCase();

  if (normalized.startsWith("data:image")) return "image";
  if (normalized.startsWith("data:audio")) return "audio";
  if (normalized.startsWith("data:video")) return "video";

  const stripped = stripUrl(value ?? "");

  if (IMAGE_EXTENSIONS.some((ext) => stripped.endsWith(ext))) return "image";
  if (AUDIO_EXTENSIONS.some((ext) => stripped.endsWith(ext))) return "audio";
  if (VIDEO_EXTENSIONS.some((ext) => stripped.endsWith(ext))) return "video";

  return null;
};

export const isLikelyImageUrl = (value?: string | null) =>
  detectMediaKind(value) === "image";

export const isLikelyAudioUrl = (value?: string | null) =>
  detectMediaKind(value) === "audio";

export const isLikelyVideoUrl = (value?: string | null) =>
  detectMediaKind(value) === "video";

export const normalizeAnswerValue = (value: string) => {
  const trimmed = value.trim();
  return isLikelyUrl(trimmed) ? trimmed : trimmed.toLowerCase();
};

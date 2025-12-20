import type { ValidFileName } from "./playnite-media-files-context.types";

export const CONTENT_HASH_FILE_NAME = "contentHash.txt" as const;
export const VALID_FILE_NAMES = ["background", "icon", "cover"] as const;
export const MEDIA_PRESETS: Record<
  ValidFileName,
  { w: number; h: number; q: number }
> = {
  background: { w: 1920, h: 1080, q: 80 },
  cover: { w: 600, h: 900, q: 82 },
  icon: { w: 256, h: 256, q: 90 },
} as const;

export const isValidFileName = (value?: string): value is ValidFileName => {
  return VALID_FILE_NAMES.includes(value as ValidFileName);
};

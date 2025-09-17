import { Image } from "@playnite-insights/lib/client";

export type ImageRepository = {
  add: (image: Omit<Image, "Id">) => void;
  all: () => Image[];
  getByChecksum: (checksum: string) => Image | null;
};

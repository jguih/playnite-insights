import { type ImageRepository } from "@playnite-insights/core";
import { imageSchema } from "@playnite-insights/lib/client";
import z from "zod";
import { type BaseRepositoryDeps, repositoryCall } from "./base";

export const makeImageRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): ImageRepository => {
  const add: ImageRepository["add"] = (image) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `
        INSERT INTO image (
          FileExtension, 
          FilePath, 
          FileName, 
          FileSize,
          CreatedAt,
          DeletedAt,
          CheckSum,
          MimeType,
          Source,
          Width,
          Height
        ) VALUES
          (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const stmt = db.prepare(query);
        stmt.run(
          image.FileExtension,
          image.FilePath,
          image.FileName,
          image.FileSize,
          image.CreatedAt,
          image.DeletedAt,
          image.CheckSum,
          image.MimeType,
          image.Source,
          image.Width,
          image.Height
        );
        logService.debug(`Created image ${image.FileName}`);
        return true;
      },
      `add(${image.FileName})`
    );
  };

  const all: ImageRepository["all"] = () => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM image`;
        const stmt = db.prepare(query);
        const result = stmt.all();
        const images = z.array(imageSchema).parse(result);
        logService.debug(`Found ${images.length} images`);
        return images;
      },
      `all()`
    );
  };

  const getByChecksum: ImageRepository["getByChecksum"] = (checksum) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const query = `SELECT * FROM image WHERE CheckSum = ?`;
        const stmt = db.prepare(query);
        const result = stmt.get(checksum);
        const image = z.optional(imageSchema).parse(result);
        if (image) logService.debug(`Found image with checksum ${checksum}`);
        return image ?? null;
      },
      `getByChecksum(${checksum})`
    );
  };

  return { add, all, getByChecksum };
};

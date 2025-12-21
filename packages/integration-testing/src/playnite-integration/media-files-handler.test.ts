import { faker } from "@faker-js/faker";
import {
  MEDIA_PRESETS,
  type ValidMediaFileFieldName,
} from "@playatlas/playnite-integration/infra";
import { createHash, Hash } from "crypto";
import { once } from "events";
import { createReadStream, openAsBlob } from "fs";
import { extname, join } from "path";
import sharp from "sharp";
import { api, fixturesDirPath } from "../vitest.setup";

const placeholdersDirPath = join(fixturesDirPath, "/images", "/placeholder");
const images: Array<{
  name: ValidMediaFileFieldName;
  filename: string;
  filepath: string;
}> = [
  {
    name: "background",
    filename: "background.png",
    filepath: join(placeholdersDirPath, "background.png"),
  },
  {
    name: "cover",
    filename: "cover.png",
    filepath: join(placeholdersDirPath, "cover.png"),
  },
  {
    name: "icon",
    filename: "icon.png",
    filepath: join(placeholdersDirPath, "icon.png"),
  },
];

const buildFormData = async (
  props: { gameId?: string; contentHash?: string } = {}
): Promise<FormData> => {
  const formData = new FormData();
  const gameId = props.gameId ?? faker.string.uuid();
  const contentHash = props.contentHash ?? faker.string.uuid();
  formData.set("gameId", gameId);
  formData.set("contentHash", contentHash);
  for (const { name, filename, filepath } of images) {
    const blob = await openAsBlob(filepath);
    formData.set(name, blob, filename);
  }
  return formData;
};

const buildRequest = (formData: FormData): Request => {
  const request = new Request(
    "https://playatlas-test.com/api/extension/sync/files",
    {
      method: "POST",
      body: formData,
    }
  );
  return request;
};

const streamFileIntoHash = async (hash: Hash, filepath: string) => {
  const stream = createReadStream(filepath);
  stream.on("data", (chunk) => hash.update(chunk));
  await once(stream, "end");
};

const buildCanonicalHashBase64 = async (props: {
  gameId: string;
  contentHash: string;
}) => {
  const SEP = Buffer.from([0]);
  const canonicalHash = createHash("sha256");

  canonicalHash.update(Buffer.from(props.gameId, "utf-8"));
  canonicalHash.update(SEP);
  canonicalHash.update(Buffer.from(props.contentHash, "utf-8"));
  canonicalHash.update(SEP);

  const files = [...images].sort((a, b) =>
    a.filename.localeCompare(b.filename, undefined, {
      sensitivity: "variant",
    })
  );

  for (const { filename, filepath } of files) {
    canonicalHash.update(Buffer.from(filename, "utf-8"));
    canonicalHash.update(SEP);

    await streamFileIntoHash(canonicalHash, filepath);
    canonicalHash.update(SEP);
  }

  const canonicalDigestBase64 = canonicalHash.digest("base64");
  return canonicalDigestBase64;
};

describe("Playnite Media Files Handler", () => {
  it("streams files to temporary dir", async () => {
    // Arrange
    const formData = await buildFormData();
    const request = buildRequest(formData);
    // Act
    await api.playniteIntegration
      .getPlayniteMediaFilesHandler()
      .withMediaFilesContext(request, async (context) => {
        // Assert
        expect(context.getStreamResults()).toHaveLength(3);
        for (const result of context.getStreamResults()) {
          const stats = await api.infra.getFsService().stat(result.filepath);
          expect(stats.isFile()).toBe(true);
        }
      });
  });

  it("verifies integrity for canonical media payload", async () => {
    // Arrange
    const gameId = faker.string.uuid();
    const contentHash = faker.string.uuid();
    const formData = await buildFormData({ gameId, contentHash });
    const canonicalDigestBase64 = await buildCanonicalHashBase64({
      gameId,
      contentHash,
    });
    const request = buildRequest(formData);
    request.headers.set("X-ContentHash", canonicalDigestBase64);

    await api.playniteIntegration
      .getPlayniteMediaFilesHandler()
      .withMediaFilesContext(request, async (context) => {
        // Act
        const isValid = await api.playniteIntegration
          .getPlayniteMediaFilesHandler()
          .verifyIntegrity(context);
        // Assert
        expect(isValid).toBe(true);
      });
  });

  it("optimizes uploaded images", async () => {
    // Arrange
    const gameId = faker.string.uuid();
    const contentHash = faker.string.uuid();
    const formData = await buildFormData({ gameId, contentHash });
    const canonicalDigestBase64 = await buildCanonicalHashBase64({
      gameId,
      contentHash,
    });
    const request = buildRequest(formData);
    request.headers.set("X-ContentHash", canonicalDigestBase64);
    const handler = api.playniteIntegration.getPlayniteMediaFilesHandler();

    await handler.withMediaFilesContext(request, async (context) => {
      // Act
      const isValid = await handler.verifyIntegrity(context);
      const optimizedResults = await handler.processImages(context);
      // Assert
      expect(isValid).toBe(true);
      for (const { filepath, name } of optimizedResults) {
        const preset = MEDIA_PRESETS[name];
        const stats = await api.infra.getFsService().stat(filepath);
        const ext = extname(filepath);
        const metadata = await sharp(filepath).metadata();

        expect(stats.isFile()).toBe(true);
        expect(filepath).toContain(join(context.getTmpDirPath(), "optimized"));
        expect(ext).toBe(".webp");
        expect(metadata.format).toBe("webp");
        expect(metadata.width).toBeLessThanOrEqual(preset.w);
        expect(metadata.height).toBeLessThanOrEqual(preset.h);
      }
      expect(optimizedResults).toHaveLength(context.getStreamResults().length);
    });
  });

  it("moves optimized images to game folder", async () => {
    // Arrange
    const gameId = faker.string.uuid();
    const contentHash = faker.string.uuid();
    const formData = await buildFormData({ gameId, contentHash });
    const canonicalDigestBase64 = await buildCanonicalHashBase64({
      gameId,
      contentHash,
    });
    const request = buildRequest(formData);
    request.headers.set("X-ContentHash", canonicalDigestBase64);
    const handler = api.playniteIntegration.getPlayniteMediaFilesHandler();

    await handler.withMediaFilesContext(request, async (context) => {
      // Act
      const isValid = await handler.verifyIntegrity(context);
      await handler.processImages(context);
      await handler.moveProcessedImagesToGameFolder(context);
      const gameFolder = join(
        api.config.getSystemConfig().getLibFilesDir(),
        context.getGameId()
      );
      const stats = await api.infra.getFsService().stat(gameFolder);
      const fileEntries = await api.infra
        .getFsService()
        .readdir(gameFolder, { withFileTypes: true });
      // Assert
      expect(isValid).toBe(true);
      expect(stats.isDirectory()).toBe(true);
      expect(fileEntries).toHaveLength(context.getStreamResults().length);
      for (const entry of fileEntries) {
        expect(entry.isFile()).toBe(true);
        const filepath = join(entry.parentPath, entry.name);
        const ext = extname(entry.name);
        const metadata = await sharp(filepath).metadata();
        expect(ext).toBe(".webp");
        expect(metadata.format).toBe("webp");
      }
      // Cleanup
      api
        .getLogService()
        .warning(`Deleting folder ${gameFolder} and all of its contents`);
      await api.infra
        .getFsService()
        .rm(gameFolder, { force: true, recursive: true });
    });
  });
});

import { faker } from "@faker-js/faker";
import { openAsBlob } from "fs";
import { join } from "path";
import { api, fixturesDirPath } from "../vitest.setup";

const placeholdersDirPath = join(fixturesDirPath, "/images", "/placeholder");
const imagePath = {
  background: join(placeholdersDirPath, "background.png"),
  cover: join(placeholdersDirPath, "cover.png"),
  icon: join(placeholdersDirPath, "icon.png"),
};

const buildFormData = async (
  props: { gameId?: string; contentHash?: string } = {}
): Promise<FormData> => {
  const formData = new FormData();
  const gameId = props.gameId ?? faker.string.uuid();
  const contentHash = props.contentHash ?? faker.string.uuid();
  formData.set("gameId", gameId);
  formData.set("contentHash", contentHash);
  const backgroundImg = await openAsBlob(imagePath.background);
  const coverImg = await openAsBlob(imagePath.cover);
  const iconImg = await openAsBlob(imagePath.icon);
  formData.set("cover", coverImg, "cover.png");
  formData.set("icon", iconImg, "icon.png");
  formData.set("background", backgroundImg, "background.png");
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
});

import { faker } from "@faker-js/faker";
import { expect, test, type APIRequestContext } from "@playwright/test";
import {
  libraryManifestSchema,
  type SyncGameListCommand,
} from "@playnite-insights/lib/client";

const createGame = (id: string): SyncGameListCommand["AddedItems"][number] => {
  return {
    Id: id,
    ContentHash: faker.string.uuid(),
    IsInstalled: faker.datatype.boolean(),
    Playtime: faker.number.int({ min: 10, max: 20000 }),
    Name: faker.book.title(),
  };
};

const getLibraryManifest = async (request: APIRequestContext) => {
  const manifestResponse = await request.get(`/api/sync/manifest`);
  expect(manifestResponse.ok()).toBeTruthy();
  const manifest = libraryManifestSchema.parse(await manifestResponse.json());
  return manifest;
};

test("library sync return error when invalid json is sent", async ({
  request,
}) => {
  // Arrange
  const invalidJson = { data: "invalid" };
  // Act
  const result = await request.post(`/api/sync/games`, { data: invalidJson });
  // Assert
  expect(result.ok()).toBeFalsy();
});

test("return ok status when command only contains empty arrays", async ({
  request,
}) => {
  // Arrange
  const data: SyncGameListCommand = {
    AddedItems: [],
    RemovedItems: [],
    UpdatedItems: [],
  };
  // Act
  const result = await request.post(`/api/sync/games`, { data: data });
  // Assert
  expect(result.ok());
});

test("add, update and delete a game on library sync", async ({ request }) => {
  // Arrange
  const gameId = faker.string.uuid();
  const addGame = createGame(gameId);
  const updateGame = createGame(gameId);
  const addData: SyncGameListCommand = {
    AddedItems: [addGame],
    RemovedItems: [],
    UpdatedItems: [],
  };
  const updateData: SyncGameListCommand = {
    AddedItems: [],
    RemovedItems: [],
    UpdatedItems: [updateGame],
  };
  const removeData: SyncGameListCommand = {
    AddedItems: [],
    RemovedItems: [gameId],
    UpdatedItems: [],
  };
  // Act & Assert
  // Add
  const addResult = await request.post(`/api/sync/games`, { data: addData });
  expect(addResult.ok()).toBeTruthy();
  let manifest = await getLibraryManifest(request);
  expect(
    manifest.gamesInLibrary.find((g) => g.gameId === addGame.Id)
  ).toBeTruthy();
  expect(
    manifest.gamesInLibrary.find((g) => g.contentHash === addGame.ContentHash)
  ).toBeTruthy();
  // Update
  const updateResult = await request.post(`/api/sync/games`, {
    data: updateData,
  });
  expect(updateResult.ok()).toBeTruthy();
  manifest = await getLibraryManifest(request);
  expect(
    manifest.gamesInLibrary.find((g) => g.gameId === updateGame.Id)
  ).toBeTruthy();
  expect(
    manifest.gamesInLibrary.find(
      (g) => g.contentHash === updateGame.ContentHash
    )
  ).toBeTruthy();
  // Remove
  const removeResult = await request.post(`/api/sync/games`, {
    data: removeData,
  });
  expect(removeResult.ok()).toBeTruthy();
  manifest = await getLibraryManifest(request);
  expect(manifest.gamesInLibrary.find((g) => g.gameId === gameId)).toBeFalsy();
});

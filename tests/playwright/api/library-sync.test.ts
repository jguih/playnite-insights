import { libraryManifestSchema } from '$lib/services/library-manifest/schemas';
import type { SyncGameListCommand } from '$lib/services/playnite-library-importer/schemas';
import { faker } from '@faker-js/faker';
import { expect, test, type APIRequestContext } from '@playwright/test';

const gameId = faker.string.uuid();

const getLibraryManifest = async (request: APIRequestContext) => {
	const manifestResponse = await request.get(`/api/sync/manifest`);
	expect(manifestResponse.ok()).toBeTruthy();
	const manifest = libraryManifestSchema.parse(await manifestResponse.json());
	return manifest;
};

test('library sync return error when invalid json is sent', async ({ request }) => {
	// Arrange
	const invalidJson = { data: 'invalid' };
	// Act
	const result = await request.post(`/api/sync/games`, { data: invalidJson });
	// Assert
	expect(result.ok()).toBeFalsy();
});

test('return ok status when command only contains empty arrays', async ({ request }) => {
	// Arrange
	const data: SyncGameListCommand = {
		AddedItems: [],
		RemovedItems: [],
		UpdatedItems: []
	};
	// Act
	const result = await request.post(`/api/sync/games`, { data: data });
	// Assert
	expect(result.ok());
});

test('add new game on library sync', async ({ request }) => {
	// Arrange
	const newGame: SyncGameListCommand['AddedItems'][number] = {
		Id: gameId,
		ContentHash: faker.string.uuid(),
		IsInstalled: false,
		Playtime: 0,
		Name: 'Test Game'
	};
	const data: SyncGameListCommand = {
		AddedItems: [newGame],
		RemovedItems: [],
		UpdatedItems: []
	};
	// Act
	const result = await request.post(`/api/sync/games`, { data: data });
	const manifestResponse = await request.get(`/api/sync/manifest`);
	expect(manifestResponse.ok()).toBeTruthy();
	const manifest = libraryManifestSchema.safeParse(await manifestResponse.json());
	const gamesInLibrary = manifest.success ? manifest.data.gamesInLibrary.map((g) => g.gameId) : [];
	// Assert
	expect(result.ok());
	expect(manifest.success).toBeTruthy();
	expect(gamesInLibrary).toContain(newGame.Id);
});

test('update game on library sync', async ({ request }) => {
	// Arrange
	const gameToUpdate: SyncGameListCommand['AddedItems'][number] = {
		Id: gameId,
		ContentHash: faker.string.uuid(),
		IsInstalled: false,
		Playtime: 0,
		Name: 'Test Game #2'
	};
	const data: SyncGameListCommand = {
		AddedItems: [],
		RemovedItems: [],
		UpdatedItems: [gameToUpdate]
	};
	let manifest = await getLibraryManifest(request);
	const oldGameInLibrary = manifest.gamesInLibrary.find((g) => g.gameId === gameId);
	const oldContentHash = oldGameInLibrary?.contentHash;
	expect(oldContentHash).toBeDefined();
	// Act
	const result = await request.post(`/api/sync/games`, { data: data });
	manifest = await getLibraryManifest(request);
	const gameInLibrary = manifest.gamesInLibrary.find((g) => g.gameId === gameId);
	const newContentHash = gameInLibrary?.contentHash;
	// Assert
	expect(result.ok());
	expect(gameInLibrary).toBeDefined();
	expect(newContentHash).toBeDefined();
	expect(oldContentHash !== newContentHash).toBeTruthy();
});

test('remove game on library sync', async ({ request }) => {
	// Arrange
	const data: SyncGameListCommand = {
		AddedItems: [],
		RemovedItems: [gameId],
		UpdatedItems: []
	};
	let manifest = await getLibraryManifest(request);
	const oldGameInLibrary = manifest.gamesInLibrary.find((g) => g.gameId === gameId);
	expect(oldGameInLibrary).toBeDefined();
	// Act
	const result = await request.post(`/api/sync/games`, { data: data });
	manifest = await getLibraryManifest(request);
	const gameInLibrary = manifest.gamesInLibrary.find((g) => g.gameId === gameId);
	// Assert
	expect(result.ok());
	expect(gameInLibrary).toBeUndefined();
});

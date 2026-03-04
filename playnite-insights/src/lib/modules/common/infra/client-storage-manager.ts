export type IClientStorageManagerPort = {
	ensureDurableStorageAsync: () => Promise<void>;
};

export class ClientStorageManager implements IClientStorageManagerPort {
	ensureDurableStorageAsync: IClientStorageManagerPort["ensureDurableStorageAsync"] = async () => {
		if (!navigator.storage?.persist) return;

		const already = await navigator.storage.persisted();
		if (already) return;

		await navigator.storage.persist();
	};
}

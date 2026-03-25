export type IProjectionCoordinatorPort = {
	reconcileAsync: () => Promise<void>;
};

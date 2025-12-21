import {
	ApiError,
	syncIdHeader,
	type ApiErrorResponse,
	type SynchronizationId,
} from '@playnite-insights/lib/client';
import type { ServerServices } from '../setup-services';

export type EnsureSyncIdDeps = {
	request: Request;
	url: URL;
	synchronizationIdRepository: ServerServices['synchronizationIdRepository'];
	logService: ServerServices['logService'];
};

export const ensureSyncId = async ({
	request,
	logService,
	synchronizationIdRepository,
}: EnsureSyncIdDeps): Promise<SynchronizationId> => {
	const syncId = request.headers.get(syncIdHeader);
	const existingSyncId = synchronizationIdRepository.get();
	if (!syncId || !existingSyncId || syncId !== existingSyncId.SyncId) {
		const response: ApiErrorResponse = {
			error: { code: 'missing_or_invalid_sync_id', message: 'Sync Id is invalid or missing' },
		};
		throw new ApiError(response, 'Sync Id is invalid or missing', 409);
	}
	logService.info(`Sync request accepted`);
	return existingSyncId;
};

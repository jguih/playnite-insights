import { services } from '$lib';
import {
	ApiError,
	syncIdHeader,
	type ApiErrorResponse,
	type SynchronizationId,
} from '@playnite-insights/lib/client';
import { getRequestDescription } from './authentication';

export const ensureSyncId = async (request: Request, url: URL): Promise<SynchronizationId> => {
	const requestDescription = getRequestDescription(request, url);
	const syncId = request.headers.get(syncIdHeader);
	const existingSyncId = services.synchronizationIdRepository.get();
	if (!syncId || !existingSyncId || syncId !== existingSyncId.SyncId) {
		const response: ApiErrorResponse = {
			error: { code: 'missing_or_invalid_sync_id', message: 'Sync Id is invalid or missing' },
		};
		throw new ApiError(response, 'Sync Id is invalid or missing', 409);
	}
	services.log.info(`${requestDescription}: Sync request accepted`);
	return existingSyncId;
};

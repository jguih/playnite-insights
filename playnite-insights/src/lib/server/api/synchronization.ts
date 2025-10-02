import { services } from '$lib';
import {
	syncIdHeader,
	type ApiErrorResponse,
	type SynchronizationId,
} from '@playnite-insights/lib/client';
import { json } from '@sveltejs/kit';
import { getRequestDescription } from './authentication';
import { handleApiError } from './handle-error';

export const withSyncId = async (
	request: Request,
	url: URL,
	cb: (syncId: SynchronizationId) => Response | Promise<Response>,
) => {
	const requestDescription = getRequestDescription(request, url);
	try {
		const syncId = request.headers.get(syncIdHeader);
		const existingSyncId = services.synchronizationIdRepository.get();
		if (!syncId || !existingSyncId || syncId !== existingSyncId.SyncId) {
			const response: ApiErrorResponse = {
				error: { code: 'missing_or_invalid_sync_id', message: 'Sync Id is invalid or missing' },
			};
			return json(response, { status: 409 });
		}
		return cb(existingSyncId);
	} catch (error) {
		return handleApiError(error, requestDescription);
	}
};

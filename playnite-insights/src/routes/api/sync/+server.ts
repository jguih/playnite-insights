import { services } from '$lib';
import { withInstanceAuth } from '$lib/server/api/authentication';
import {
	clientSyncReconciliationCommandSchema,
	type ApiErrorResponse,
	type ServerSyncReconciliationResponse,
} from '@playnite-insights/lib/client';
import { json, type RequestHandler } from '@sveltejs/kit';

/**
 * POST /api/sync
 *
 * Reconciles sync state between client and server.
 * - Used when client has a different sync id than the server.
 * - Server will return it's sync id along with all sync state.
 *
 * @returns {Promise<Response>}
 * - 200 Ok → Reconciliation successful
 * - 500 Internal Error
 */
export const POST: RequestHandler = async ({ request, url }): Promise<Response> =>
	withInstanceAuth(request, url, async () => {
		const syncId = services.synchronizationIdRepository.get();
		if (!syncId) {
			const response: ApiErrorResponse = {
				error: { code: 'internal_error', message: 'Sync id not found, please restart the server' },
			};
			return json(response, { status: 500 });
		}

		const jsonBody = await request.json();
		const command = clientSyncReconciliationCommandSchema.parse(jsonBody);
		services.synchronization.reconcile(command);

		const notes = services.gameNoteRepository.all();
		const response: ServerSyncReconciliationResponse = {
			syncId: syncId.SyncId,
			notes,
		};

		return json(response);
	});

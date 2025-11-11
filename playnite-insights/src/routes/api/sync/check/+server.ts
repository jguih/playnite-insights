import { withInstanceAuth } from '$lib/infra/api/authentication';
import { ensureSyncId } from '$lib/infra/api/synchronization';
import { emptyResponse } from '$lib/infra/api/utils';
import type { RequestHandler } from '@sveltejs/kit';

/**
 * GET /api/sync/check
 *
 * Check if consumer's sync id is valid.
 *
 * @header X-Sync-Id {`string`} → The client’s syncId
 *
 * @returns {Promise<Response>}
 * - 200 Ok → Sync id is the same as server's
 * - 409 Conflict → Invalid Sync id
 * - 500 Internal Error
 */
export const GET: RequestHandler = ({ request, url, locals: { services } }): Promise<Response> =>
	withInstanceAuth(request, url, services, async () => {
		await ensureSyncId({ request, url, ...services });
		return emptyResponse(200);
	});

import type {
	ExtensionAuthServiceVerifyResult,
	InstanceAuthServiceVerifyResult,
} from '@playatlas/auth/application';
import type { PlayAtlasApi } from '@playatlas/bootstrap/application';
import { json } from '@sveltejs/kit';
import { ZodError } from 'zod/v4';
import { apiResponse } from '../responses';

export type AuthMiddlewareDeps = {
	request: Request;
	api: PlayAtlasApi;
};

export const extensionAuthMiddleware = async (
	{ request, api }: AuthMiddlewareDeps,
	cb: (result: ExtensionAuthServiceVerifyResult) => Response | Promise<Response>,
) => {
	const utcNow = Date.now();
	const requestDescription = api.getLogService().getRequestDescription(request);
	const result = await api.auth.getExtensionAuthService().verify({ request, utcNow });
	if (!result.authorized) {
		return json({ error: { message: result.reason } }, { status: 403 });
	}
	try {
		return await cb(result);
	} catch (error) {
		if (error instanceof ZodError) {
			api
				.getLogService()
				.error(
					`${requestDescription}: Zod validation error while handling request: ${error.message}`,
				);
			return apiResponse.error({ error: { message: error.message } }, { status: 400 });
		}
		api.getLogService().error(`${requestDescription}: Error thrown while handling request`, error);
		return apiResponse.error({ error: { message: 'Internal server error' } }, { status: 500 });
	}
};

export const instanceAuthMiddleware = async (
	{ request, api }: AuthMiddlewareDeps,
	cb: (result: InstanceAuthServiceVerifyResult) => Response | Promise<Response>,
) => {
	const requestDescription = api.getLogService().getRequestDescription(request);
	const result = api.auth.getInstanceAuthService().verify({ request });
	if (!result.authorized) {
		return json({ error: { message: result.reason } }, { status: 403 });
	}
	try {
		return await cb(result);
	} catch (error) {
		api.getLogService().error(`${requestDescription}: Error thrown while handling request`, error);
		return apiResponse.error({ error: { message: 'Internal server error' } }, { status: 500 });
	}
};

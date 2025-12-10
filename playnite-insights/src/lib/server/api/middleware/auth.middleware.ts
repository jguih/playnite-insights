import type {
	ExtensionAuthServiceVerifyResult,
	InstanceAuthServiceVerifyResult,
} from '@playatlas/auth/application';
import type { PlayAtlasApi } from '@playatlas/bootstrap/application';
import { json } from '@sveltejs/kit';

export type AuthMiddlewareDeps = {
	request: Request;
	api: PlayAtlasApi;
};

export const extensionAuthMiddleware = async (
	{ request, api }: AuthMiddlewareDeps,
	cb: (result: ExtensionAuthServiceVerifyResult) => Response | Promise<Response>,
) => {
	const utcNow = Date.now();
	const result = await api.auth.getExtensionAuthService().verify({ request, utcNow });
	if (!result.authorized) {
		return json({ error: { message: result.reason } }, { status: 403 });
	}
	return await cb(result);
};

export const instanceAuthMiddleware = async (
	{ request, api }: AuthMiddlewareDeps,
	cb: (result: InstanceAuthServiceVerifyResult) => Response | Promise<Response>,
) => {
	const result = api.auth.getInstanceAuthService().verify({ request });
	if (!result.authorized) {
		return json({ error: { message: result.reason } }, { status: 403 });
	}
	return await cb(result);
};

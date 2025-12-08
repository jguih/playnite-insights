import type { ExtensionAuthServiceVerifyResult } from '@playatlas/auth/application';
import type { PlayAtlasApi } from '@playatlas/bootstrap/application';
import { json } from '@sveltejs/kit';

export type ExtensionAuthMiddlewareDeps = {
	request: Request;
	api: PlayAtlasApi;
};

type Callback = (result: ExtensionAuthServiceVerifyResult) => Response | Promise<Response>;

export const extensionAuthMiddleware = async (
	{ request, api }: ExtensionAuthMiddlewareDeps,
	cb: Callback,
) => {
	const utcNow = Date.now();
	const result = await api.auth.getExtensionAuthService().verify({ request, utcNow });
	if (!result.authorized) {
		return json({ error: { message: result.reason } }, { status: 403 });
	}
	return await cb(result);
};

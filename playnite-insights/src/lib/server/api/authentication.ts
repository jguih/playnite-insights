import { json } from '@sveltejs/kit';
import type { ServerServices } from '../setup-services';
import { handleApiError } from './handle-error';

export const getRequestDescription = (request: Request, url: URL) =>
	`${request.method} ${url.pathname}`;

export const withInstanceAuth = async (
	request: Request,
	url: URL,
	services: ServerServices,
	cb: (isAuthorized: boolean) => Response | Promise<Response>,
	passThroughAuth?: boolean,
) => {
	const requestDescription = getRequestDescription(request, url);
	try {
		const verify = services.authService.verifyInstanceAuth({
			headers: { Authorization: request.headers.get('Authorization') },
			request: { method: request.method },
			url: { pathname: url.pathname, searchParams: new URLSearchParams(url.searchParams) },
		});
		if (!passThroughAuth && !verify.isAuthorized) {
			return json({ error: { code: verify.code } }, { status: 403 });
		}
		const result = await cb(verify.isAuthorized);
		return result;
	} catch (error) {
		return handleApiError(error, services.logService, requestDescription);
	}
};

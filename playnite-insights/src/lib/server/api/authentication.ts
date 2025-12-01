import { validAuthenticationHeaders } from '@playnite-insights/lib/client';
import { json } from '@sveltejs/kit';
import type { ServerServices } from '../setup-services';
import { handleApiError } from './handle-error';
import { computeBase64HashAsync } from './hash';

export const getRequestDescription = (request: Request, url: URL) =>
	`${request.method} ${url.pathname}`;

export const withExtensionAuth = async (
	request: Request,
	url: URL,
	services: ServerServices,
	strategy: 'text' | 'none',
	cb: (rawBody?: string) => Response | Promise<Response>,
) => {
	const requestDescription = getRequestDescription(request, url);
	try {
		const isAuthorized = services.authService.verifyExtensionAuth({
			headers: {
				'X-ExtensionId': request.headers.get(validAuthenticationHeaders['X-ExtensionId']),
				'X-Signature': request.headers.get(validAuthenticationHeaders['X-Signature']),
				'X-Timestamp': request.headers.get(validAuthenticationHeaders['X-Timestamp']),
				'X-ContentHash': request.headers.get(validAuthenticationHeaders['X-ContentHash']),
				'X-RegistrationId': request.headers.get(validAuthenticationHeaders['X-RegistrationId']),
			},
			request: { method: request.method },
			url: { pathname: url.pathname },
			now: Date.now(),
		});
		if (!isAuthorized) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}
		let rawBody: string | undefined = undefined;
		switch (strategy) {
			case 'text': {
				rawBody = await request.text();
				const contentHash = request.headers.get(validAuthenticationHeaders['X-ContentHash'])!;
				const computedHash = await computeBase64HashAsync(rawBody);
				if (contentHash !== computedHash) {
					services.logService.warning(
						`${requestDescription}: Request rejected because calculated content hash does not match received one`,
					);
					return json({ error: 'Unauthorized' }, { status: 403 });
				}
				break;
			}
			case 'none':
			default: {
				break;
			}
		}
		return await cb(rawBody);
	} catch (error) {
		return handleApiError(error, services.logService, requestDescription);
	}
};

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

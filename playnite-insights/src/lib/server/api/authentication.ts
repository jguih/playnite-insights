import { services } from '$lib';
import { validAuthenticationHeaders } from '@playnite-insights/lib/client';
import { json } from '@sveltejs/kit';
import { handleApiError } from './handle-error';
import { computeBase64HashAsync } from './hash';

export const withExtensionAuth = async (
	request: Request,
	url: URL,
	strategy: 'text' | 'none',
	cb: (rawBody?: string) => Response | Promise<Response>,
) => {
	const requestDescription = `${request.method} ${url.pathname}`;
	try {
		const isAuthorized = services.authentication.verifyExtensionAuthorization({
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
					services.log.warning(
						`${requestDescription}: Request rejected bacause calculated content hash does not match received one`,
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
		return cb(rawBody);
	} catch (error) {
		return handleApiError(error, requestDescription);
	}
};

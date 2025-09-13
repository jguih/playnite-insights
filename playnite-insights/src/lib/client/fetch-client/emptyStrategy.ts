import type { IFetchClientStrategy } from './IFetchClientStrategy';
import { FetchClientStrategyError } from './error/fetchClientStrategyError';

export class EmptyStrategy implements IFetchClientStrategy {
	constructor() {}

	async handleAsync(response: Response) {
		const status = response.status;

		if (status === 204) {
			return null;
		}

		if (status !== 204) {
			const contentLength = response.headers.get('content-length');
			if (contentLength && Number(contentLength) > 0) {
				console.warn('Unexpected body returned for EmptyStrategy request');
			}
		}

		if (!response.ok) {
			throw new FetchClientStrategyError({
				message: `Request failed with code ${status}`,
				statusCode: status,
				data: null,
			});
		}

		return null;
	}
}

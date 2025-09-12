// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FetchClientStrategyError } from './error/fetchClientStrategyError';
import type { HttpGetProps, HttpPostProps } from './types';

export class FetchClient {
	#url: string;

	constructor({ url }: { url: string }) {
		this.#url = url;
	}

	private safeJoinUrlAndEndpoint = (url: string, endpoint?: string) => {
		if (!endpoint) return url;
		const parsedEndpoint = endpoint.startsWith('/')
			? endpoint.substring(1, endpoint.length)
			: endpoint;
		const parsedApiUrl = url.endsWith('/') ? url : `${url}/`;
		return `${parsedApiUrl}${parsedEndpoint}`;
	};

	/**
	 * @throws {FetchClientStrategyError} Error indicating strategy failure
	 * @throws {TypeError} If a network error occurs (e.g., failed to fetch)
	 * @throws {HttpError} If the response status is not ok
	 */
	httpGetAsync = async <Output>({
		endpoint,
		strategy,
		...props
	}: HttpGetProps<Output>): Promise<Output> => {
		const parsedUrl = this.safeJoinUrlAndEndpoint(this.#url, endpoint);
		const response = await fetch(parsedUrl, {
			...props,
			method: 'GET',
		});
		const result = await strategy.handleAsync(response);
		return result;
	};

	/**
	 * @throws {FetchClientStrategyError} Error indicating strategy failure
	 * @throws {TypeError} If a network error occurs (e.g., failed to fetch)
	 * @throws {HttpError} If the response status is not ok
	 */
	httpPostAsync = async <Output>({
		endpoint,
		strategy,
		body,
		...props
	}: HttpPostProps<Output>): Promise<Output> => {
		const parsedUrl = this.safeJoinUrlAndEndpoint(this.#url, endpoint);
		let response: Response;
		if (body instanceof FormData) {
			response = await fetch(parsedUrl, {
				...props,
				body: body,
				method: 'POST',
			});
		} else {
			response = await fetch(parsedUrl, {
				...props,
				body: JSON.stringify(body),
				method: 'POST',
				headers: {
					...props.headers,
					'Content-Type': 'application/json',
				},
			});
		}
		const result = await strategy.handleAsync(response);
		return result;
	};
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { IFetchClient } from './fetchClient.types';

export class FetchClient implements IFetchClient {
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

	httpGetAsync: IFetchClient['httpGetAsync'] = async ({ endpoint, strategy, ...props }) => {
		const parsedUrl = this.safeJoinUrlAndEndpoint(this.#url, endpoint);
		const response = await fetch(parsedUrl, {
			...props,
			method: 'GET',
		});
		const result = await strategy.handleAsync(response);
		return result;
	};

	httpDeleteAsync: IFetchClient['httpDeleteAsync'] = async ({
		endpoint,
		strategy,
		body,
		...props
	}) => {
		const parsedUrl = this.safeJoinUrlAndEndpoint(this.#url, endpoint);
		let response: Response;
		if (body instanceof FormData) {
			response = await fetch(parsedUrl, {
				...props,
				body: body,
				method: 'DELETE',
			});
		} else {
			response = await fetch(parsedUrl, {
				...props,
				body: JSON.stringify(body),
				method: 'DELETE',
				headers: {
					...props.headers,
					'Content-Type': 'application/json',
				},
			});
		}
		const result = await strategy.handleAsync(response);
		return result;
	};

	httpPostAsync: IFetchClient['httpPostAsync'] = async ({ endpoint, strategy, body, ...props }) => {
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

	httpPutAsync: IFetchClient['httpPutAsync'] = async ({ endpoint, strategy, body, ...props }) => {
		const parsedUrl = this.safeJoinUrlAndEndpoint(this.#url, endpoint);
		let response: Response;
		if (body instanceof FormData) {
			response = await fetch(parsedUrl, {
				...props,
				body: body,
				method: 'PUT',
			});
		} else {
			response = await fetch(parsedUrl, {
				...props,
				body: JSON.stringify(body),
				method: 'PUT',
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

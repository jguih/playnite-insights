import { FetchClientStrategyError } from './fetchClientStrategyError';
import type { HttpGetProps } from './types';

export type FetchClientResponse<T> = {
	success: boolean;
	statusCode: number | null;
	data: T | null;
	error: {
		message: string;
	} | null;
};

export class FetchClient {
	#url: string;

	constructor({ url }: { url: string }) {
		this.#url = url;
	}

	private parseError = <T>(error: unknown): FetchClientResponse<T> => {
		if (error instanceof FetchClientStrategyError) {
			return {
				success: false,
				statusCode: error.statusCode,
				data: null,
				error: {
					message: error.message,
				},
			};
		}
		if (error instanceof TypeError) {
			return {
				success: false,
				statusCode: null,
				data: null,
				error: {
					message: error.message,
				},
			};
		}
		if (error instanceof Error) {
			return {
				success: false,
				statusCode: null,
				data: null,
				error: {
					message: error.message,
				},
			};
		}
		return {
			success: false,
			statusCode: null,
			data: null,
			error: null,
		};
	};

	private safeJoinUrlAndEndpoint = (url: string, endpoint?: string) => {
		if (!endpoint) return url;
		const parsedEndpoint = endpoint.startsWith('/')
			? endpoint.substring(1, endpoint.length)
			: endpoint;
		const parsedApiUrl = url.endsWith('/') ? url : `${url}/`;
		return `${parsedApiUrl}${parsedEndpoint}`;
	};

	httpGetAsync = async <Output>({
		endpoint,
		strategy,
		...props
	}: HttpGetProps<Output>): Promise<FetchClientResponse<Output>> => {
		const parsedUrl = this.safeJoinUrlAndEndpoint(this.#url, endpoint);
		try {
			const response = await fetch(parsedUrl, {
				...props,
				method: 'GET',
			});
			const result = await strategy.handleAsync(response);
			if (result) {
				return {
					success: true,
					data: result,
					statusCode: response.status,
					error: null,
				};
			}
			return {
				success: true,
				data: null,
				statusCode: response.status,
				error: null,
			};
		} catch (error) {
			return this.parseError<Output>(error);
		}
	};
}

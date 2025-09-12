import { ZodSchema } from 'zod';
import type { IFetchClientStrategy } from './IFetchClientStrategy';
import { FetchClientStrategyError } from './error/fetchClientStrategyError';

export class JsonStrategy<Output> implements IFetchClientStrategy<Output> {
	schema: ZodSchema<Output>;

	constructor(schema: ZodSchema<Output>) {
		this.schema = schema;
	}

	async handleAsync(response: Response) {
		const contentType = response.headers.get('content-type');
		const isJsonResponse = contentType?.includes('application/json') ?? false;
		const status = response.status;

		if (!isJsonResponse) {
			throw new FetchClientStrategyError({
				message: 'Response body is not JSON',
				statusCode: status,
			});
		}

		if (response.ok && status === 204) {
			throw new FetchClientStrategyError({
				message: 'Empty response body',
				statusCode: status,
			});
		}

		const originalJson = await response.json();

		if (!response.ok) {
			throw new FetchClientStrategyError({
				message: `Request failed with code ${status}`,
				statusCode: status,
				data: originalJson,
			});
		}

		// Response is Ok and not 204
		const zodResult = await this.schema.safeParseAsync(originalJson);
		if (zodResult.success) {
			return zodResult.data;
		}

		throw new FetchClientStrategyError({
			message: 'Request succeded, but response body failed to parse using schema',
			statusCode: status,
			data: zodResult.error.format(),
		});
	}
}

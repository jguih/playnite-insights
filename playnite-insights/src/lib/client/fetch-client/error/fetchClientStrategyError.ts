export type FetchClientStrategyErrorProps = {
	message: string;
	statusCode: number;
	data?: unknown;
};

export class FetchClientStrategyError extends Error {
	statusCode: number;
	data?: unknown;

	constructor({ statusCode, message, data }: FetchClientStrategyErrorProps) {
		super();
		this.statusCode = statusCode;
		this.message = message;
		this.data = data;
	}
}

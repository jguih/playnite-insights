import type { HttpDeleteProps, HttpGetProps, HttpPostProps, HttpPutProps } from './types';

export interface IFetchClient {
	/**
	 * @throws {FetchClientStrategyError} Error indicating strategy failure
	 * @throws {TypeError} If a network error occurs (e.g., failed to fetch)
	 * @throws {HttpError} If the response status is not ok
	 */
	httpGetAsync: <Output>(args: HttpGetProps<Output>) => Promise<Output>;
	/**
	 * @throws {FetchClientStrategyError} Error indicating strategy failure
	 * @throws {TypeError} If a network error occurs (e.g., failed to fetch)
	 * @throws {HttpError} If the response status is not ok
	 */
	httpPostAsync: <Output>(args: HttpPostProps<Output>) => Promise<Output>;
	/**
	 * @throws {FetchClientStrategyError} Error indicating strategy failure
	 * @throws {TypeError} If a network error occurs (e.g., failed to fetch)
	 * @throws {HttpError} If the response status is not ok
	 */
	httpPutAsync: <Output>(args: HttpPutProps<Output>) => Promise<Output>;
	/**
	 * @throws {FetchClientStrategyError} Error indicating strategy failure
	 * @throws {TypeError} If a network error occurs (e.g., failed to fetch)
	 * @throws {HttpError} If the response status is not ok
	 */
	httpDeleteAsync: <Output>(args: HttpDeleteProps<Output>) => Promise<Output>;
}

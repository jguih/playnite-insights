import type { IFetchClientStrategy } from "./IFetchClientStrategy";
import { FetchClientStrategyError } from "./error/fetchClientStrategyError";

export class EmptyStrategy implements IFetchClientStrategy {
  constructor() {}

  async handleAsync(response: Response) {
    const status = response.status;
    const contentLength = response.headers.get("content-length");
    const contentType = response.headers.get("content-type");
    const isJsonResponse = contentType?.includes("application/json") ?? false;

    if (status === 204) {
      return null;
    }

    if (status !== 204) {
      if (contentLength && Number(contentLength) > 0) {
        console.warn("Unexpected body returned for EmptyStrategy request");
      }
    }

    if (!response.ok) {
      const data = isJsonResponse ? await response.json() : null;
      throw new FetchClientStrategyError({
        message: `Request failed with code ${status}`,
        statusCode: status,
        data: data,
      });
    }

    return null;
  }
}

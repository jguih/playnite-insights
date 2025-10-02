// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { FetchClientStrategyError } from "./error";
import type { IFetchClient } from "./fetchClient.types";

export class FetchClient implements IFetchClient {
  private url: string;
  private globalHeaders: (() => Promise<Headers> | Headers) | undefined =
    undefined;

  constructor({
    url,
    globalHeaders,
  }: {
    url: string;
    globalHeaders?: () => Promise<Headers> | Headers;
  }) {
    this.url = url;
    this.globalHeaders = globalHeaders;
  }

  private safeJoinUrlAndEndpoint = (url: string, endpoint?: string) => {
    if (!endpoint) return url;
    const parsedEndpoint = endpoint.startsWith("/")
      ? endpoint.substring(1, endpoint.length)
      : endpoint;
    const parsedApiUrl = url.endsWith("/") ? url : `${url}/`;
    return `${parsedApiUrl}${parsedEndpoint}`;
  };

  private mergeHeaders(...all: (HeadersInit | undefined)[]): Headers {
    const merged = new Headers();
    for (const h of all) {
      if (!h) continue;
      const current = new Headers(h);
      current.forEach((value, key) => {
        merged.append(key, value);
      });
    }
    return merged;
  }

  httpGetAsync: IFetchClient["httpGetAsync"] = async ({
    endpoint,
    strategy,
    ...props
  }) => {
    const parsedUrl = this.safeJoinUrlAndEndpoint(this.url, endpoint);
    let response: Response | null = null;
    try {
      const globalHeaders = await this.globalHeaders?.();
      response = await fetch(parsedUrl, {
        ...props,
        method: "GET",
        headers: this.mergeHeaders(globalHeaders, props.headers),
      });
      const result = await strategy.handleAsync(response);
      return result;
    } catch (error) {
      if (error instanceof FetchClientStrategyError) throw error;
      throw new FetchClientStrategyError({
        statusCode: response?.status ?? 503,
        message: (error as Error).message ?? "",
        data: { cause: error },
      });
    }
  };

  httpDeleteAsync: IFetchClient["httpDeleteAsync"] = async ({
    endpoint,
    strategy,
    body,
    ...props
  }) => {
    const parsedUrl = this.safeJoinUrlAndEndpoint(this.url, endpoint);
    let response: Response | null = null;
    try {
      const globalHeaders = await this.globalHeaders?.();
      if (body instanceof FormData) {
        response = await fetch(parsedUrl, {
          ...props,
          body: body,
          method: "DELETE",
          headers: this.mergeHeaders(globalHeaders, props.headers),
        });
      } else {
        response = await fetch(parsedUrl, {
          ...props,
          body: JSON.stringify(body),
          method: "DELETE",
          headers: this.mergeHeaders(globalHeaders, props.headers, {
            "Content-Type": "application/json",
          }),
        });
      }
      const result = await strategy.handleAsync(response);
      return result;
    } catch (error) {
      if (error instanceof FetchClientStrategyError) throw error;
      throw new FetchClientStrategyError({
        statusCode: response?.status ?? 503,
        message: (error as Error).message ?? "",
        data: { cause: error },
      });
    }
  };

  httpPostAsync: IFetchClient["httpPostAsync"] = async ({
    endpoint,
    strategy,
    body,
    ...props
  }) => {
    const parsedUrl = this.safeJoinUrlAndEndpoint(this.url, endpoint);
    let response: Response | null = null;
    try {
      const globalHeaders = await this.globalHeaders?.();
      if (body instanceof FormData) {
        response = await fetch(parsedUrl, {
          ...props,
          body: body,
          method: "POST",
          headers: this.mergeHeaders(globalHeaders, props.headers),
        });
      } else {
        response = await fetch(parsedUrl, {
          ...props,
          body: JSON.stringify(body),
          method: "POST",
          headers: this.mergeHeaders(globalHeaders, props.headers, {
            "Content-Type": "application/json",
          }),
        });
      }
      const result = await strategy.handleAsync(response);
      return result;
    } catch (error) {
      if (error instanceof FetchClientStrategyError) throw error;
      throw new FetchClientStrategyError({
        statusCode: response?.status ?? 503,
        message: (error as Error).message ?? "",
        data: { cause: error },
      });
    }
  };

  httpPutAsync: IFetchClient["httpPutAsync"] = async ({
    endpoint,
    strategy,
    body,
    ...props
  }) => {
    const parsedUrl = this.safeJoinUrlAndEndpoint(this.url, endpoint);
    let response: Response | null = null;
    try {
      const globalHeaders = await this.globalHeaders?.();
      if (body instanceof FormData) {
        response = await fetch(parsedUrl, {
          ...props,
          body: body,
          method: "PUT",
          headers: this.mergeHeaders(globalHeaders, props.headers),
        });
      } else {
        response = await fetch(parsedUrl, {
          ...props,
          body: JSON.stringify(body),
          method: "PUT",
          headers: this.mergeHeaders(globalHeaders, props.headers, {
            "Content-Type": "application/json",
          }),
        });
      }
      const result = await strategy.handleAsync(response);
      return result;
    } catch (error) {
      if (error instanceof FetchClientStrategyError) throw error;
      throw new FetchClientStrategyError({
        statusCode: response?.status ?? 503,
        message: (error as Error).message ?? "",
        data: { cause: error },
      });
    }
  };
}

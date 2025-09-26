import { type IFetchClient } from "@playnite-insights/lib/client";
import { vi } from "vitest";

export const makeFetchClientMock = () => {
  return {
    httpDeleteAsync: vi.fn(),
    httpGetAsync: vi.fn(),
    httpPostAsync: vi.fn(),
    httpPutAsync: vi.fn(),
  } satisfies IFetchClient;
};

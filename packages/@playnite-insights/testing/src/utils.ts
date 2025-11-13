import { faker } from "@faker-js/faker";
import { syncIdHeader } from "@playnite-insights/lib/client";
import type { Cookies, RequestEvent } from "@sveltejs/kit";
import { randomUUID } from "node:crypto";
import type { DatabaseSync } from "node:sqlite";
import type { ServerServices } from "../../../../playnite-insights/src/lib/server/setup-services";
import type { MakeJsonRequestDeps, MakeRequestEventDeps } from "./utils.types";

const shuffleArray = <T>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const clearAllTables = (db: DatabaseSync): void => {
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all()
    .map((t) => t.name);

  for (const table of tables) {
    db.exec(`DELETE FROM ${table};`);
  }
};

/**
 * Creates a request event cookies to be used in a  `RequestEvent`
 */
const makeRequestEventCookies = (
  initial: Record<string, string> = {}
): Cookies => {
  const store = new Map(Object.entries(initial));

  return {
    get: (name: string) => store.get(name) ?? null,
    getAll: () =>
      Array.from(store.entries()).map(([name, value]) => ({
        name,
        value,
      })),
    set: (name: string, value: string) => {
      store.set(name, value);
    },
    delete: (name: string) => {
      store.delete(name);
    },
    serialize: () => "",
  } as Cookies;
};

/**
 * Creates a request event to be used when calling Svelte API Handlers directly
 */
const makeRequestEvent = (data: MakeRequestEventDeps): RequestEvent => {
  const url = new URL(data.request?.url ?? "http://test/");
  return {
    request: data.request ?? new Request(url),
    locals: data.locals,
    params: data.params ?? {},
    route: data.route ?? { id: null },
    url,
    platform: data.platform ?? {},
    cookies: data.cookies ?? makeRequestEventCookies(),
    getClientAddress: () => "127.0.0.1",
    isDataRequest: false,
    fetch: globalThis.fetch,
    isSubRequest: true,
    setHeaders: () => {},
  };
};

const registerInstanceAndCreateSessionAsync = async (
  services: ServerServices
): Promise<string> => {
  const pass = faker.string.uuid();
  await services.authService.registerInstanceAsync(pass);
  const sessionId = await services.authService.loginInstanceAsync(pass);
  return sessionId;
};

const setSyncId = (services: ServerServices, now: Date): string => {
  const syndId = randomUUID();
  services.synchronizationIdRepository.set({
    Id: 1,
    SyncId: syndId,
    CreatedAt: now.toISOString(),
    LastUsedAt: now.toISOString(),
  });
  return syndId;
};

const getClientHeaders = (sessionId?: string, syncId?: string): Headers => {
  const headers = new Headers();
  if (sessionId) headers.set("Authorization", `Bearer ${sessionId}`);
  if (syncId) headers.set(syncIdHeader, syncId);
  return headers;
};

const baseUrl = new URL("https://test.com");
const makeJsonRequest = ({
  endpoint,
  method,
  body,
  sessionId,
  syncId,
}: MakeJsonRequestDeps): Request => {
  const url = new URL(endpoint, baseUrl);
  return new Request(url, {
    method,
    body: JSON.stringify(body),
    headers: getClientHeaders(sessionId, syncId),
  });
};

export const testUtils = {
  shuffleArray,
  clearAllTables,
  createMockEvent: makeRequestEvent,
  registerInstanceAndCreateSessionAsync,
  setSyncId,
  makeJsonRequest,
};

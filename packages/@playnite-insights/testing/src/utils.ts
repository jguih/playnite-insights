import type { Cookies, RequestEvent } from "@sveltejs/kit";
import type { DatabaseSync } from "node:sqlite";

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array]; // copy to avoid mutating original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
  }
  return arr;
}

function clearAllTables(db: DatabaseSync) {
  const tables = db
    .prepare(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
    )
    .all()
    .map((t) => t.name);

  for (const table of tables) {
    db.exec(`DELETE FROM ${table};`);
  }
}

function createMockCookies(initial: Record<string, string> = {}): Cookies {
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
}

/**
 * Creates a mock event to be used when calling Svelte API Handlers directly
 */
function createMockEvent(data: Partial<RequestEvent> = {}): RequestEvent {
  const url = new URL(data.request?.url ?? "http://test/");
  return {
    request: data.request ?? new Request(url),
    locals: data.locals ?? ({} as App.Locals),
    params: data.params ?? {},
    route: data.route ?? { id: null },
    url,
    platform: data.platform ?? {},
    cookies: data.cookies ?? createMockCookies(),
    getClientAddress: () => "127.0.0.1",
    isDataRequest: false,
    fetch: globalThis.fetch,
    isSubRequest: true,
    setHeaders: () => {},
  };
}

export const testUtils = { shuffleArray, clearAllTables, createMockEvent };

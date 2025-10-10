import type { RequestEvent } from "@sveltejs/kit";

export type MakeJsonRequestDeps = {
  endpoint: string;
  method: "POST" | "PUT";
  body: object;
  sessionId?: string;
  syncId?: string;
};

export type MakeRequestEventDeps = Partial<Omit<RequestEvent, "locals">> & {
  locals: App.Locals;
};

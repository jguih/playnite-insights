import type { LogService } from "@playatlas/shared/core";
import { makeLogService } from "@playatlas/shared/infra";
import { type APISSEvent } from "@playnite-insights/lib/client";

export type EventStreamDeps = {
  onCancel?: () => void;
  isAuthorized: boolean;
  logService: LogService;
};

export class EventStream {
  private controller: ReadableStreamDefaultController | null = null;
  private stream: ReadableStream;
  private heartBeatInterval: ReturnType<typeof setInterval> | null = null;
  private logService: LogService;

  constructor({ onCancel, isAuthorized, logService }: EventStreamDeps) {
    this.logService = logService;

    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;

        if (!isAuthorized) {
          this.send({
            type: "authError",
            data: { status: 403, message: "Not authorized" },
          });
          this.logService.warning(
            `Request to create new Event Stream not authorized`
          );
          this.cleanup();
          return;
        }

        this.logService.info(`Created new Event Stream`);
        this.send({ data: true, type: "heartbeat" });
        this.heartBeatInterval = setInterval(() => {
          this.send({ data: true, type: "heartbeat" });
        }, 15_000);
      },
      cancel: () => {
        this.logService.info(`Closed or aborted Event Stream`);
        this.cleanup();
        onCancel?.();
      },
    });
  }

  get response(): Response {
    return new Response(this.stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  }

  cleanup() {
    if (this.heartBeatInterval) clearInterval(this.heartBeatInterval);
    this.controller = null;
  }

  send(apiEvent: APISSEvent) {
    if (!this.controller) return;
    const chunk = this.encodeSSE(apiEvent);
    this.controller.enqueue(chunk);
  }

  private encodeSSE(apiEvent: APISSEvent) {
    let msg = "";
    msg += `event: ${apiEvent.type}\n`;
    let parsedData = "";
    if (typeof apiEvent.data === "string") parsedData = apiEvent.data;
    else parsedData = JSON.stringify(apiEvent.data);
    for (const line of parsedData.split("\n")) {
      msg += `data: ${line}\n`;
    }
    return new TextEncoder().encode(msg + "\n");
  }
}

export type SSEManagerDeps = {
  logService: LogService;
};

export class SSEManager {
  private streams = new Set<EventStream>();
  private logService: LogService;

  constructor({ logService }: SSEManagerDeps) {
    this.logService = logService;
  }

  createStream({
    isAuthorized,
    onCancel,
  }: Omit<EventStreamDeps, "logService">): EventStream {
    const stream = new EventStream({
      onCancel: () => {
        this.streams.delete(stream);
        onCancel?.();
      },
      isAuthorized: isAuthorized,
      logService: this.logService,
    });
    this.streams.add(stream);
    return stream;
  }

  broadcast(apiEvent: APISSEvent): void {
    this.logService.info(`Broadcasting message of type '${apiEvent.type}'`);
    for (const stream of [...this.streams]) {
      stream.send(apiEvent);
    }
  }
}

export const defaultSSEManager: SSEManager = new SSEManager({
  logService: makeLogService("SSEManager"),
});

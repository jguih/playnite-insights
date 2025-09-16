import { APISSEvent } from "@playnite-insights/lib/client";

export class EventStream {
  private controller: ReadableStreamDefaultController | null = null;
  private stream: ReadableStream;

  constructor({ onClose }: { onClose?: () => void } = {}) {
    this.stream = new ReadableStream({
      start: (controller) => {
        this.controller = controller;
        this.send({ data: "connected", type: "message" });
      },
      cancel: () => {
        this.controller = null;
        onClose?.();
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

export class SSEManager {
  private streams = new Set<EventStream>();

  createStream(): EventStream {
    const stream = new EventStream({
      onClose: () => this.streams.delete(stream),
    });
    this.streams.add(stream);
    return stream;
  }

  broadcast(apiEvent: APISSEvent): void {
    this.streams.forEach((stream) => {
      stream.send(apiEvent);
    });
  }
}

export const defaultSSEManager: SSEManager = new SSEManager();

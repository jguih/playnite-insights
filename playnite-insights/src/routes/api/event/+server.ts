import type { RequestHandler } from "@sveltejs/kit";

export const GET: RequestHandler = async ({ request, locals: { api } }) => {
	const encoder = new TextEncoder();
	let closed = false;
	let interval: NodeJS.Timeout;

	const closeStream = () => {
		closed = true;
		clearInterval(interval);
		api.getLogService().info("Closed exporter event stream");
	};

	const stream = new ReadableStream({
		start(controller) {
			api.getLogService().info("Created exporter event stream");

			const unsubscribe = api.getEventBus().subscribe((event) => {
				if (closed) return;

				api.getLogService().info(`Broadcasting event (Name: ${event.name}, Id: ${event.id})`);
				controller.enqueue(
					encoder.encode(
						`id: ${event.id}\n` +
							`event: ${event.name}\n` +
							`data: ${JSON.stringify("payload" in event ? event.payload : {})}\n\n`,
					),
				);
			});

			interval = setInterval(() => {
				if (closed) return;

				try {
					controller.enqueue(`: ping\n\n`);
				} catch {
					clearInterval(interval);
				}
			}, 15_000);

			request.signal.addEventListener("abort", () => {
				unsubscribe();
				closeStream();
			});
		},

		cancel() {
			closeStream();
		},
	});

	return new Response(stream, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
};

export function emptyResponse(status: 204 | 304 | 200 = 204) {
	return new Response(null, { status });
}

export function badRequest() {
	return new Response(null, { status: 400 });
}

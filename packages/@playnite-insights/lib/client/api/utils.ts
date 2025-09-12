export function emptyResponse(status: 204 | 304 = 204) {
  return new Response(null, { status });
}

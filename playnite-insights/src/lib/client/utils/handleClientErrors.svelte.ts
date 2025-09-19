export const handleClientErrors = (error: unknown, message: string) => {
	console.error(`${message}`, error);
	// if (error instanceof HttpClientNotSetError) {
	// 	toast.error({ title: message, message: m.error_http_client_not_set(), category: 'network' });
	// } else if (error instanceof FetchClientStrategyError) {
	// 	toast.error({ title: message, message: error.message, category: 'network' });
	// } else if (error instanceof AppError) {
	// 	toast.error({ title: message, message: error.message, category: 'app' });
	// } else {
	// 	toast.error({ title: message, message: m.error_something_went_wrong(), category: 'app' });
	// }
};

export type AppToast = {
	key: string;
	title?: string;
	message: string;
	type: 'info' | 'error' | 'warning' | 'success';
	durationMs?: number;
	action?: () => void | Promise<void>;
};

let toastSignal = $state<AppToast[]>([]);

const pushToast = (toast: Omit<AppToast, 'key'>) => {
	const newToast: AppToast = { ...toast, key: crypto.randomUUID() };
	const currentToasts: AppToast[] = [...toastSignal];
	const duration = toast.durationMs ?? 6_000;
	const newToasts: AppToast[] = [...currentToasts, newToast];
	toastSignal = newToasts;

	setTimeout(() => {
		const newToasts = [...toastSignal].filter((t) => t.key !== newToast.key);
		toastSignal = newToasts;
	}, duration);
};

export const toast = {
	info: (props: Omit<AppToast, 'type' | 'key'>) => pushToast({ type: 'info', ...props }),
	error: (props: Omit<AppToast, 'type' | 'key'>) => pushToast({ type: 'error', ...props }),
	warning: (props: Omit<AppToast, 'type' | 'key'>) => pushToast({ type: 'warning', ...props }),
	success: (props: Omit<AppToast, 'type' | 'key'>) => pushToast({ type: 'success', ...props }),
};

export const getToasts = () => toastSignal;

export const dismissToast = (i: number) => {
	const newToasts = [...toastSignal].filter((_, index) => index !== i);
	toastSignal = newToasts;
};

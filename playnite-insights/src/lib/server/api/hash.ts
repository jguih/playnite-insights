import { createHash } from 'crypto';

const sortKeys = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map(sortKeys);
	} else if (value && typeof value === 'object') {
		return Object.keys(value)
			.sort()
			.reduce(
				(acc, key) => {
					(acc as Record<string, unknown>)[key] = sortKeys((value as Record<string, unknown>)[key]);
					return acc;
				},
				{} as Record<string, unknown>,
			);
	}
	return value;
};

export const createHashForObject = (data: unknown) => {
	const jsonStr = JSON.stringify(sortKeys(data));
	return createHash('sha1').update(jsonStr).digest('hex');
};

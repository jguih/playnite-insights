import { createHash } from 'crypto';

export const createHashForObject = (data: unknown) => {
	const jsonStr = JSON.stringify(data);
	return createHash('sha256').update(jsonStr).digest('hex');
};

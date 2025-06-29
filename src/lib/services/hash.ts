import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { createHash } from 'crypto';
import { logError } from './log';
import type { ValidationResult } from '$lib/models/validation-result';

export async function hashFolderContents(dir: string): Promise<ValidationResult<string>> {
	try {
		const entries = await readdir(dir, { withFileTypes: true });
		const files = entries
			.filter((entry) => entry.isFile())
			.map((entry) => entry.name)
			.sort();

		const hash = createHash('sha256');
		for (const file of files) {
			const filePath = join(dir, file);
			const stats = await stat(filePath);
			hash.update(file);
			hash.update(stats.size.toString());
			hash.update(stats.mtimeMs.toString());
		}
		return {
			isValid: true,
			data: hash.digest('hex'),
			httpCode: 200,
			message: `Hash for ${dir} created sucessfully`
		};
	} catch (error) {
		logError(`Failed to hash contents of ${dir}`, error as Error);
		return {
			isValid: false,
			message: `Failed to hash contents of ${dir}`,
			httpCode: 500
		};
	}
}

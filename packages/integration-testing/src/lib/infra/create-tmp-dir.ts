import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

export const createTempDataDirAsync = async () => {
	return await mkdtemp(join(tmpdir(), "playatlas-test-"));
};

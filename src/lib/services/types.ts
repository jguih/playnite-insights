import * as fsAsync from 'fs/promises';
import * as fs from 'fs';
import * as stream from 'stream';
import * as streamAsync from 'stream/promises';

export type FileSystemAsyncDeps = {
	readdir: typeof fsAsync.readdir;
	readfile: typeof fsAsync.readFile;
	writeFile: typeof fsAsync.writeFile;
	access: typeof fsAsync.access;
	rm: typeof fsAsync.rm;
	unlink: typeof fsAsync.unlink;
};

export type StreamUtilsAsyncDeps = {
	readableFromWeb: typeof stream.Readable.fromWeb;
	pipeline: typeof streamAsync.pipeline;
	createWriteStream: typeof fs.createWriteStream;
};

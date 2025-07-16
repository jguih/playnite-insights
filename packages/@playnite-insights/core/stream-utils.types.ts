import * as fs from "fs";
import * as stream from "stream";
import * as streamAsync from "stream/promises";

export type StreamUtilsService = {
  readableFromWeb: typeof stream.Readable.fromWeb;
  pipeline: typeof streamAsync.pipeline;
  createWriteStream: typeof fs.createWriteStream;
};

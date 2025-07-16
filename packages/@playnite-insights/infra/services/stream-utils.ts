import { StreamUtilsService } from "../../core/stream-utils";
import * as fs from "fs";
import * as stream from "stream";
import * as streamAsync from "stream/promises";

export const makeStreamUtilsService = (): StreamUtilsService => {
  return {
    createWriteStream: fs.createWriteStream,
    pipeline: streamAsync.pipeline,
    readableFromWeb: stream.Readable.fromWeb,
  };
};

export const defaultStreamUtilsService: StreamUtilsService =
  makeStreamUtilsService();

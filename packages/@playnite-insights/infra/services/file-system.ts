import { type FileSystemService } from "@playnite-insights/core";
import * as fsAsync from "fs/promises";

export const makeFileSystemService = (): FileSystemService => {
  return {
    access: fsAsync.access,
    mkdir: fsAsync.mkdir,
    readdir: fsAsync.readdir,
    readfile: fsAsync.readFile,
    rm: fsAsync.rm,
    stat: fsAsync.stat,
    unlink: fsAsync.unlink,
    writeFile: fsAsync.writeFile,
    constants: fsAsync.constants,
    rename: fsAsync.rename,
  };
};

export const defaultFileSystemService: FileSystemService =
  makeFileSystemService();

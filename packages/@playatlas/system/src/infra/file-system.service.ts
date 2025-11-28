import { type FileSystemService } from "@playatlas/common/domain";
import { existsSync, statSync } from "fs";
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
    isDir: (path) => {
      return existsSync(path) && statSync(path).isDirectory();
    },
  };
};

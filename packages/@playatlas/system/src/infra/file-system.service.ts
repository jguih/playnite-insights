import { type FileSystemService } from "@playatlas/common/application";
import * as fs from "fs";
import * as fsAsync from "fs/promises";

export const makeFileSystemService = (): FileSystemService => {
  return {
    access: fsAsync.access,
    mkdir: fsAsync.mkdir,
    mkdirSync: fs.mkdirSync,
    readdir: fsAsync.readdir,
    readfile: fsAsync.readFile,
    rm: fsAsync.rm,
    stat: fsAsync.stat,
    unlink: fsAsync.unlink,
    writeFile: fsAsync.writeFile,
    constants: fsAsync.constants,
    rename: fsAsync.rename,
    createWriteStream: fs.createWriteStream,
    createReadStream: fs.createReadStream,
    isDir: (path) => {
      return fs.existsSync(path) && fs.statSync(path).isDirectory();
    },
  };
};

export const defaultFsService = makeFileSystemService();

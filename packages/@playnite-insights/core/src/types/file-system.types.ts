import * as fsAsync from "fs/promises";

export type FileSystemService = {
  readdir: typeof fsAsync.readdir;
  readfile: typeof fsAsync.readFile;
  writeFile: typeof fsAsync.writeFile;
  access: typeof fsAsync.access;
  rm: typeof fsAsync.rm;
  unlink: typeof fsAsync.unlink;
  stat: typeof fsAsync.stat;
  constants: typeof fsAsync.constants;
  mkdir: typeof fsAsync.mkdir;
  rename: typeof fsAsync.rename;
};

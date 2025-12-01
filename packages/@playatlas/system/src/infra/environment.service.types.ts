import { type FileSystemService } from "@playatlas/common/application";

export type EnvServiceDeps = {
  fsService: FileSystemService;
  env: {
    PLAYATLAS_DATA_DIR?: string;
    PLAYATLAS_WORK_DIR?: string;
    PLAYATLAS_MIGRATIONS_DIR?: string;
    PLAYATLAS_LOG_LEVEL?: string;
    PLAYATLAS_USE_IN_MEMORY_DB?: string;
  };
};

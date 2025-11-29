import { LogServiceFactory } from "@playatlas/common/application";
import { makeLogService } from "./log.service";

export const makeLogServiceFactory = (): LogServiceFactory => {
  return {
    build: (context) => makeLogService(context),
  };
};

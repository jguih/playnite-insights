import {
  LogLevelNumber,
  LogServiceFactory,
} from "@playatlas/common/application";
import { makeLogService } from "./log.service";

export type LogServiceFactoryDeps = {
  getCurrentLogLevel: () => LogLevelNumber;
};

export const makeLogServiceFactory = ({
  getCurrentLogLevel,
}: LogServiceFactoryDeps): LogServiceFactory => {
  return {
    build: (context) => makeLogService(context, getCurrentLogLevel),
  };
};

import type { LogService } from "../domain/log-service.types";

const PERFORMANCE_WARN_THRESHOLD_MS = 50;

export const repositoryCall = <T>(
  logService: LogService,
  fn: () => T,
  context?: string
): T => {
  const start = performance.now();
  try {
    const result = fn();
    const duration = performance.now() - start;
    const message = `Repository call ${
      context ? context : ""
    } took ${duration.toFixed(1)}ms`;
    if (duration >= PERFORMANCE_WARN_THRESHOLD_MS) logService.warning(message);
    else logService.debug(message);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logService.error(
      `Repository call ${
        context ? context : ""
      } failed after ${duration.toFixed(1)}ms`,
      error
    );
    throw error;
  }
};

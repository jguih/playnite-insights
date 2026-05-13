import { MINUTE_MS } from "@playatlas/common/domain";

export const JOB_QUEUE_LOCK_TIMEOUT_MS = 15 * MINUTE_MS;
export const JOB_QUEUE_BACKOFF_DELAY_MS = 5 * MINUTE_MS;
export const JOB_QUEUE_MAX_BACKOFF_DELAY_MS = 60 * MINUTE_MS;

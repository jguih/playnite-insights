import { EntityRepository } from "@playatlas/common/infra";
import {
  InstanceSession,
  InstanceSessionId,
} from "../domain/instance-session.entity";

export type InstanceSessionRepository = EntityRepository<
  InstanceSessionId,
  InstanceSession
>;

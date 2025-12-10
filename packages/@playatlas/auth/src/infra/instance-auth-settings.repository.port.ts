import { EntityRepository } from "@playatlas/common/infra";
import {
  InstanceAuthSettings,
  InstanceAuthSettingsId,
} from "../domain/instance-auth-settings.entity";

export type InstanceAuthSettingsRepository = Omit<
  EntityRepository<InstanceAuthSettingsId, InstanceAuthSettings>,
  "add" | "update" | "exists"
>;

import type { QueryHandler } from "@playatlas/common/common";
import { createHashForObject } from "@playatlas/common/infra";
import { extensionRegistrationMapper } from "../../extension-registration.mapper";
import type { GetAllExtensionRegistrationQuery } from "./get-all-extension-registration.query";
import type {
  GetAllExtensionRegistrationsQueryHandlerDeps,
  GetAllExtensionRegistrationsResult,
} from "./get-all-extension-registration.query.types";

export type GetAllExtensionRegistrationsQueryHandler = QueryHandler<
  GetAllExtensionRegistrationQuery,
  GetAllExtensionRegistrationsResult
>;

export const makeGetAllExtensionRegistrationsQueryHandler = ({
  extensionRegistrationRepository,
}: GetAllExtensionRegistrationsQueryHandlerDeps): GetAllExtensionRegistrationsQueryHandler => {
  return {
    execute: ({ ifNoneMatch } = {}) => {
      const registrations = extensionRegistrationRepository.all();

      if (!registrations || registrations.length === 0) {
        return { type: "ok", data: [], etag: '"empty"' };
      }

      const registrationDtos =
        extensionRegistrationMapper.toDtoList(registrations);
      const hash = createHashForObject(registrationDtos);
      const etag = `"${hash}"`;

      if (ifNoneMatch === etag) {
        return { type: "not_modified" };
      }

      return { type: "ok", data: registrationDtos, etag };
    },
  };
};

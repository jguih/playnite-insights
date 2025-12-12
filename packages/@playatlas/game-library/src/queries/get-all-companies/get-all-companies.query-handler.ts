import { QueryHandler } from "@playatlas/common/common";
import { createHashForObject } from "@playatlas/common/infra";
import { companyMapper } from "../../company.mapper";
import { GetAllCompaniesQuery } from "./get-all-companies.query";
import {
  GetAllCompaniesQueryHandlerDeps,
  GetAllCompaniesQueryResult,
} from "./get-all-companies.query.types";

export type GetAllCompaniesQueryHandler = QueryHandler<
  GetAllCompaniesQuery,
  GetAllCompaniesQueryResult
>;

export const makeGetAllCompaniesQueryHandler = ({
  companyRepository,
}: GetAllCompaniesQueryHandlerDeps): GetAllCompaniesQueryHandler => {
  return {
    execute: ({ ifNoneMatch } = {}) => {
      const companies = companyRepository.all();

      if (!companies || companies.length === 0) {
        return { type: "ok", data: [], etag: '"empty"' };
      }

      const companyDtos = companyMapper.toDtoList(companies);
      const hash = createHashForObject(companyDtos);
      const etag = `"${hash}"`;

      if (ifNoneMatch === etag) {
        return { type: "not_modified" };
      }

      return { type: "ok", data: companyDtos, etag };
    },
  };
};

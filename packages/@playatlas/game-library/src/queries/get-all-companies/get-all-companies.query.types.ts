import { CompanyResponseDto } from "../../dtos/company.response.dto";
import { CompanyRepository } from "../../infra";

export type GetAllCompaniesQueryHandlerDeps = {
  companyRepository: CompanyRepository;
};

export type GetAllCompaniesQueryResult =
  | { type: "not_modified" }
  | { type: "ok"; data: CompanyResponseDto[]; etag: string };

import { type EntityMapper } from "@playatlas/common/application";
import { Company, makeCompany } from "./domain/company.entity";
import { CompanyModel } from "./infra/company.repository";

export const companyMapper: EntityMapper<Company, CompanyModel> = {
  toPersistence: (company: Company): CompanyModel => {
    const record: CompanyModel = {
      Id: company.getId(),
      Name: company.getName(),
    };
    return record;
  },
  toDomain: (company: CompanyModel): Company => {
    const entity: Company = makeCompany({
      id: company.Id,
      name: company.Name,
    });
    return entity;
  },
};

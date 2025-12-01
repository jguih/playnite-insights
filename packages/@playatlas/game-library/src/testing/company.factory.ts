import { faker } from "@faker-js/faker";
import { type Company, makeCompany } from "../domain/company.entity";
import type { MakeCompanyProps } from "../domain/company.entity.types";

export type CompanyFactory = {
  buildCompany: (props?: Partial<MakeCompanyProps>) => Company;
  buildCompanyList: (n: number, props?: Partial<MakeCompanyProps>) => Company[];
};

export const makeCompanyFactory = (): CompanyFactory => {
  const buildCompany: CompanyFactory["buildCompany"] = (props = {}) => {
    return makeCompany({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.company.name(),
    });
  };

  const buildCompanyList: CompanyFactory["buildCompanyList"] = (
    n,
    props = {}
  ) => {
    return Array.from({ length: n }, () => buildCompany(props));
  };

  return { buildCompany, buildCompanyList };
};

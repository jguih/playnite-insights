import { faker } from "@faker-js/faker";
import { makeCompany } from "../domain/company.entity";
import type { MakeCompanyProps } from "../domain/company.entity.types";

export const makeCompanyFactory = () => {
  const buildCompany = (props: Partial<MakeCompanyProps> = {}) => {
    return makeCompany({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.company.name(),
    });
  };

  const buildCompanyList = (
    n: number,
    props: Partial<MakeCompanyProps> = {}
  ) => {
    return Array.from({ length: n }, () => buildCompany(props));
  };

  return { buildCompany, buildCompanyList };
};

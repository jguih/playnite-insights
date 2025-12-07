import { faker } from "@faker-js/faker";
import { TestEntityFactory } from "@playatlas/common/testing";
import { type Company, makeCompany } from "../domain/company.entity";
import type { MakeCompanyProps } from "../domain/company.entity.types";

export type CompanyFactory = TestEntityFactory<MakeCompanyProps, Company>;

export const makeCompanyFactory = (): CompanyFactory => {
  const build: CompanyFactory["build"] = (props = {}) => {
    return makeCompany({
      id: props.id ?? faker.string.uuid(),
      name: props.name ?? faker.company.name(),
    });
  };

  const buildList: CompanyFactory["buildList"] = (n, props = {}) => {
    return Array.from({ length: n }, () => build(props));
  };

  return { build, buildList };
};

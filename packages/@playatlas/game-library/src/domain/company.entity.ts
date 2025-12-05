import { BaseEntity } from "@playatlas/common/domain";
import { MakeCompanyProps } from "./company.entity.types";

export type CompanyId = string;
type CompanyName = string;

export type Company = BaseEntity<CompanyId> &
  Readonly<{
    getName: () => CompanyName;
  }>;

export const makeCompany = (props: MakeCompanyProps): Company => {
  const _id: CompanyId = props.id;
  const _name: CompanyName = props.name;

  const company: Company = {
    getId: () => _id,
    getName: () => _name,
    validate: () => {},
  };
  return Object.freeze(company);
};

import { MakeCompanyProps } from "./company.entity.types";

export type CompanyId = string;
type CompanyName = string;

export type Company = Readonly<{
  getId: () => CompanyId;
  getName: () => CompanyName;
}>;

export const makeCompany = (props: MakeCompanyProps): Company => {
  const _id: CompanyId = props.id;
  const _name: CompanyName = props.name;

  return Object.freeze({
    getId: () => _id,
    getName: () => _name,
  });
};

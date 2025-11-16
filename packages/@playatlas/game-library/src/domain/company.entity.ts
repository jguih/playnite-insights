import { MakeCompanyProps } from "./company.entity.types";

export type CompanyId = string;
export type Company = Readonly<{
  getId: () => CompanyId;
  getName: () => string;
}>;

export const makeCompany = (props: MakeCompanyProps): Company => {
  const _id = props.id;
  const _name = props.name;

  return Object.freeze({
    getId: () => _id,
    getName: () => _name,
  });
};

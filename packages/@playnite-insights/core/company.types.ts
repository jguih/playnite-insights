import { Company } from "@playnite-insights/lib";

export type CompanyRepository = {
  add: (platform: Company) => boolean;
  exists: (company: Pick<Company, "Id" | "Name">) => boolean;
  update: (platform: Company) => boolean;
  getById: (id: string) => Company | undefined;
  hasChanges: (oldCompany: Company, newCompany: Company) => boolean;
  all: () => Company[] | undefined;
};

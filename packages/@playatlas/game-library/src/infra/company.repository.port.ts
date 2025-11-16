import type { Company, CompanyId } from "../domain/company.entity";

export type CompanyRepository = {
  add: (platform: Company) => void;
  exists: (id: CompanyId) => boolean;
  update: (platform: Company) => void;
  getById: (id: string) => Company | null;
  all: () => Company[];
  upsertMany: (companies: Company[]) => void;
};

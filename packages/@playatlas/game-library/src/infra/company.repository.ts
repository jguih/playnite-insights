import {
  BaseRepositoryDeps,
  makeBaseRepository,
} from "@playatlas/common/infra";
import z from "zod";
import { companyMapper } from "../company.mapper";
import { Company, CompanyId } from "../domain/company.entity";
import type { CompanyRepository } from "./company.repository.port";

export const companySchema = z.object({
  Id: z.string(),
  Name: z.string(),
});

export type CompanyModel = z.infer<typeof companySchema>;

export const makeCompanyRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): CompanyRepository => {
  const TABLE_NAME = "company";
  const COLUMNS: (keyof CompanyModel)[] = ["Id", "Name"];
  const base = makeBaseRepository<CompanyId, Company, CompanyModel>({
    getDb,
    logService,
    config: {
      tableName: TABLE_NAME,
      idColumn: "Id",
      insertColumns: COLUMNS,
      updateColumns: COLUMNS.filter((c) => c !== "Id"),
      mapper: companyMapper,
      modelSchema: companySchema,
    },
  });

  const add: CompanyRepository["add"] = (company) => base.add(company);

  const upsert: CompanyRepository["upsert"] = (company) => base.upsert(company);

  const exists: CompanyRepository["exists"] = (id) => base.exists(id);

  const update: CompanyRepository["update"] = (company) => base.update(company);

  const getById: CompanyRepository["getById"] = (id) => base.getById(id);

  const all: CompanyRepository["all"] = () => base.all();

  const remove: CompanyRepository["remove"] = (id) => base.remove(id);

  return {
    add,
    upsert,
    update,
    exists,
    getById,
    all,
    remove,
  };
};

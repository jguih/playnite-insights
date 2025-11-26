import {
  BaseRepositoryDeps,
  makeRepositoryBase,
} from "@playatlas/common/infra";
import z from "zod";
import { companyMapper } from "../company.mapper";
import { Company } from "../domain/company.entity";
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
  const base = makeRepositoryBase({ getDb, logService });

  const add = (company: Company): boolean => {
    const query = `
      INSERT INTO ${TABLE_NAME}
        (Id, Name)
      VALUES
        (?, ?);
      `;
    return base.run(({ db }) => {
      const model = companyMapper.toPersistence(company);
      const stmt = db.prepare(query);
      stmt.run(model.Id, model.Name);
      logService.debug(`Created company (${model.Id}, ${model.Name})`);
      return true;
    }, `add()`);
  };

  const upsertMany: CompanyRepository["upsertMany"] = (companies) => {
    return base.run(({ db }) => {
      const query = `
          INSERT INTO ${TABLE_NAME}
            (Id, Name)
          VALUES
            (?, ?)
          ON CONFLICT DO UPDATE SET
            Name = excluded.Name;
          `;
      const stmt = db.prepare(query);
      db.exec("BEGIN TRANSACTION");
      try {
        for (const company of companies) {
          const model = companyMapper.toPersistence(company);
          stmt.run(model.Id, model.Name);
        }
        db.exec("COMMIT");
      } catch (error) {
        db.exec("ROLLBACK");
        throw error;
      }
    }, `upsertMany(${companies.length} companies)`);
  };

  const exists: CompanyRepository["exists"] = (id): boolean => {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM company 
        WHERE Id = (?)
      );
    `;
    return base.run(({ db }) => {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    }, `exists(${id})`);
  };

  const update = (company: Company): boolean => {
    const query = `
      UPDATE company
      SET
        Name = ?
      WHERE Id = ?;
    `;
    return base.run(({ db }) => {
      const model = companyMapper.toPersistence(company);
      const stmt = db.prepare(query);
      stmt.run(model.Name, model.Id);
      logService.debug(`Updated company (${model.Id}, ${model.Name})`);
      return true;
    }, `update(${company.getId()}, ${company.getName()})`);
  };

  const getById: CompanyRepository["getById"] = (id: string) => {
    const query = `
      SELECT *
      FROM company
      WHERE Id = ?;
    `;
    return base.run(({ db }) => {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const company = z.optional(companySchema).parse(result);
      logService.debug(`Found company: ${company?.Name}`);
      return company ? companyMapper.toDomain(company) : null;
    }, `getById(${id})`);
  };

  const all: CompanyRepository["all"] = () => {
    const query = `SELECT * FROM company ORDER BY Name ASC`;
    return base.run(({ db }) => {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const companyModels =
        z.optional(z.array(companySchema)).parse(result) ?? [];
      const companies: Company[] = [];
      for (const model of companyModels) {
        companies.push(companyMapper.toDomain(model));
      }
      logService.debug(`Found ${companies?.length ?? 0} companies`);
      return companies;
    }, `all()`);
  };

  return {
    add,
    upsertMany,
    update,
    exists,
    getById,
    all,
  };
};

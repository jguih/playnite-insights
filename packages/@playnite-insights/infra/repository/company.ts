import { companySchema, type Company } from "@playatlas/game-library/core";
import type { CompanyRepository } from "@playnite-insights/core";
import z from "zod";
import { repositoryCall, type BaseRepositoryDeps } from "./base";

export const makeCompanyRepository = ({
  getDb,
  logService,
}: BaseRepositoryDeps): CompanyRepository => {
  const TABLE_NAME = "company";

  const add = (company: Company): boolean => {
    const query = `
      INSERT INTO ${TABLE_NAME}
        (Id, Name)
      VALUES
        (?, ?);
      `;
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmt = db.prepare(query);
        stmt.run(company.Id, company.Name);
        logService.debug(`Created company (${company.Id}, ${company.Name})`);
        return true;
      },
      `add()`
    );
  };

  const upsertMany: CompanyRepository["upsertMany"] = (companies) => {
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
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
          for (const company of companies) stmt.run(company.Id, company.Name);
          db.exec("COMMIT");
        } catch (error) {
          db.exec("ROLLBACK");
          throw error;
        }
      },
      `upsertMany(${companies.length} companies)`
    );
  };

  const exists = (company: Company): boolean => {
    const query = `
      SELECT EXISTS (
        SELECT 1 FROM company 
        WHERE Id = (?)
      );
    `;
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(company.Id);
        if (result) {
          return Object.values(result)[0] === 1;
        }
        return false;
      },
      `exists(${company.Id}, ${company.Name})`
    );
  };

  const update = (company: Company): boolean => {
    const query = `
      UPDATE company
      SET
        Name = ?
      WHERE Id = ?;
    `;
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmt = db.prepare(query);
        stmt.run(company.Name, company.Id);
        logService.debug(`Updated company (${company.Id}, ${company.Name})`);
        return true;
      },
      `update(${company.Id}, ${company.Name})`
    );
  };

  const getById = (id: string): Company | undefined => {
    const query = `
      SELECT *
      FROM company
      WHERE Id = ?;
    `;
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmt = db.prepare(query);
        const result = stmt.get(id);
        const company = z.optional(companySchema).parse(result);
        logService.debug(`Found company: ${company?.Name}`);
        return company;
      },
      `getById(${id})`
    );
  };

  const hasChanges = (oldCompany: Company, newCompany: Company): boolean => {
    return oldCompany.Id != newCompany.Id || oldCompany.Name != newCompany.Name;
  };

  const all: CompanyRepository["all"] = () => {
    const query = `SELECT * FROM company ORDER BY Name ASC`;
    return repositoryCall(
      logService,
      () => {
        const db = getDb();
        const stmt = db.prepare(query);
        const result = stmt.all();
        const companies = z.optional(z.array(companySchema)).parse(result);
        logService.debug(`Found ${companies?.length ?? 0} companies`);
        return companies;
      },
      `all()`
    );
  };

  return {
    add,
    upsertMany,
    update,
    exists,
    getById,
    hasChanges,
    all,
  };
};

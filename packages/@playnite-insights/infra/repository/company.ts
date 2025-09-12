import type { CompanyRepository } from "@playnite-insights/core";
import { companySchema, type Company } from "@playnite-insights/lib/client";
import z from "zod";
import {
  BaseRepositoryDeps,
  defaultRepositoryDeps,
  repositoryCall,
} from "./base";

export const makeCompanyRepository = (
  deps: Partial<BaseRepositoryDeps> = {}
): CompanyRepository => {
  const { getDb, logService } = { ...defaultRepositoryDeps, ...deps };

  const add = (company: Company): boolean => {
    const query = `
      INSERT INTO company
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
    update,
    exists,
    getById,
    hasChanges,
    all,
  };
};

export const defaultCompanyRepository: CompanyRepository =
  makeCompanyRepository();

import type { CompanyRepository, LogService } from "@playnite-insights/core";
import { companySchema, type Company } from "@playnite-insights/lib/client";
import type { DatabaseSync } from "node:sqlite";
import { getDb as _getDb } from "../database";
import { defaultLogger } from "../services";
import z from "zod";

type CompanyRepositoryDeps = {
  getDb: () => DatabaseSync;
  logService: LogService;
};

const defaultDeps: Required<CompanyRepositoryDeps> = {
  getDb: _getDb,
  logService: defaultLogger,
};

export const makeCompanyRepository = (
  deps: Partial<CompanyRepositoryDeps> = {}
): CompanyRepository => {
  const { getDb, logService } = { ...defaultDeps, ...deps };

  const add = (company: Company): boolean => {
    const db = getDb();
    const query = `
    INSERT INTO company
      (Id, Name)
    VALUES
      (?, ?);
  `;
    try {
      const stmt = db.prepare(query);
      stmt.run(company.Id, company.Name);
      logService.debug(`Added company ${company.Name}`);
      return true;
    } catch (error) {
      logService.error(`Failed to add company ${company.Name}`, error as Error);
      return false;
    }
  };

  const exists = (company: Company): boolean => {
    const db = getDb();
    const query = `
    SELECT EXISTS (
      SELECT 1 FROM company 
      WHERE Id = (?)
    );
  `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(company.Id);
      if (result) {
        return Object.values(result)[0] === 1;
      }
      return false;
    } catch (error) {
      logService.error(
        `Failed to check if company ${company.Name} exists`,
        error as Error
      );
      return false;
    }
  };

  const update = (company: Company): boolean => {
    const db = getDb();
    const query = `
    UPDATE company
    SET
      Name = ?
    WHERE Id = ?;
  `;
    try {
      const stmt = db.prepare(query);
      stmt.run(company.Name, company.Id);
      logService.debug(`Updated data for company ${company.Name}`);
      return true;
    } catch (error) {
      logService.error(
        `Failed to update company ${company.Name}`,
        error as Error
      );
      return false;
    }
  };

  const getById = (id: string): Company | undefined => {
    const db = getDb();
    const query = `
      SELECT *
      FROM company
      WHERE Id = ?;
    `;
    try {
      const stmt = db.prepare(query);
      const result = stmt.get(id);
      const company = z.optional(companySchema).parse(result);
      logService.debug(`Found company: ${company?.Name}`);
      return company;
    } catch (error) {
      logService.error(`Failed to get company with if ${id}`, error as Error);
      return;
    }
  };

  const hasChanges = (oldCompany: Company, newCompany: Company): boolean => {
    return oldCompany.Id != newCompany.Id || oldCompany.Name != newCompany.Name;
  };

  const all: CompanyRepository["all"] = () => {
    const db = getDb();
    const query = `SELECT * FROM company ORDER BY Name ASC`;
    try {
      const stmt = db.prepare(query);
      const result = stmt.all();
      const companies = z.optional(z.array(companySchema)).parse(result);
      logService.debug(`Found ${companies?.length ?? 0} companies`);
      return companies;
    } catch (error) {
      logService.error(`Failed to get company list`, error as Error);
    }
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

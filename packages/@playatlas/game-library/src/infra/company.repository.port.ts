import { EntityRepository } from "@playatlas/common/infra";
import type { Company, CompanyId } from "../domain/company.entity";

export type CompanyRepository = EntityRepository<CompanyId, Company> & {};

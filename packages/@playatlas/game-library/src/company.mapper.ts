import { type EntityMapper } from "@playatlas/common/application";
import { type Company, makeCompany } from "./domain/company.entity";
import type { CompanyResponseDto } from "./dtos";
import type { CompanyModel } from "./infra/company.repository";

const _toDto = (entity: Company): CompanyResponseDto => {
  const dto: CompanyResponseDto = {
    Id: entity.getId(),
    Name: entity.getName(),
  };
  return dto;
};

export const companyMapper: EntityMapper<
  Company,
  CompanyModel,
  CompanyResponseDto
> = {
  toPersistence: (company: Company): CompanyModel => {
    const record: CompanyModel = {
      Id: company.getId(),
      Name: company.getName(),
    };
    return record;
  },
  toDomain: (company: CompanyModel): Company => {
    const entity: Company = makeCompany({
      id: company.Id,
      name: company.Name,
    });
    return entity;
  },
  toDto: _toDto,
  toDtoList: (entities) => {
    const dtos: CompanyResponseDto[] = [];
    for (const entity of entities) dtos.push(_toDto(entity));
    return dtos;
  },
};

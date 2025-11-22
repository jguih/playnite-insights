import { CompanyId } from "./company.entity";
import { GenreId } from "./genre.entity";
import { PlatformId } from "./platform.entity";

export type MakeGameRelationshipProps = {
  developerIds?: CompanyId[] | null;
  publisherIds?: CompanyId[] | null;
  genreIds?: GenreId[] | null;
  platformIds?: PlatformId[] | null;
};

export type MakeGameProps = {
  id: string;
  name?: string | null;
  description?: string | null;
  releaseDate?: Date | null;
  playtime?: number;
  lastActivity?: Date | null;
  added?: Date | null;
  installDirectory?: string | null;
  isInstalled?: boolean;
  backgroundImage?: string | null;
  coverImage?: string | null;
  icon?: string | null;
  hidden?: boolean;
  completionStatusId?: string | null;
  contentHash: string;
} & MakeGameRelationshipProps;

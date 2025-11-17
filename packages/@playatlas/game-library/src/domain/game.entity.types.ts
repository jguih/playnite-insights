export type MakeGameRelationshipProps = {
  developerIds?: string[] | null;
  publisherIds?: string[] | null;
  genreIds?: string[] | null;
  platformIds?: string[] | null;
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

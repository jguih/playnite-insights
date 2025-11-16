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
};

export type MakeFullGameProps = MakeGameProps & {
  developers: string[];
  publishers: string[];
  genres: string[];
  platforms: string[];
};

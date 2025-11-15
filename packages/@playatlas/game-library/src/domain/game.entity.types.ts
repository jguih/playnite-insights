export type MakeGameProps = {
  Id: string;
  Name?: string | null;
  Description?: string | null;
  ReleaseDate?: Date | null;
  Playtime?: number;
  LastActivity?: Date | null;
  Added?: Date | null;
  InstallDirectory?: string | null;
  IsInstalled?: boolean | number;
  BackgroundImage?: string | null;
  CoverImage?: string | null;
  Icon?: string | null;
  Hidden?: boolean | number;
  CompletionStatusId?: string | null;
  ContentHash: string;
};

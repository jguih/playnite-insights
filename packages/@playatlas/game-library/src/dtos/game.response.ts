import { GameId } from "../domain/game.entity";

export type GameResponseDto = {
  Id: GameId;
  Name: string | null;
  Description: string | null;
  ReleaseDate: string | null;
  Playtime: number;
  LastActivity: string | null;
  Added: string | null;
  InstallDirectory: string | null;
  IsInstalled: number;
  BackgroundImage: string | null;
  CoverImage: string | null;
  Icon: string | null;
  Hidden: number;
  CompletionStatusId: string | null;
  ContentHash: string;
  Developers: string[];
  Publishers: string[];
  Genres: string[];
  Platforms: string[];
};

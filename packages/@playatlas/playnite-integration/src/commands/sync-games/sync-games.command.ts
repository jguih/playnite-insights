import { SyncGamesRequestDto } from "./sync-games.request.dto";

export type SyncGamesCommandItem = {
  Id: string;

  Name?: string | null;
  Description?: string | null;

  Platforms?:
    | {
        SpecificationId: string;
        Icon?: string | null;
        Cover?: string | null;
        Background?: string | null;
        Id: string;
        Name: string;
      }[]
    | null;

  Genres?:
    | {
        Id: string;
        Name: string;
      }[]
    | null;

  Developers?:
    | {
        Id: string;
        Name: string;
      }[]
    | null;

  Publishers?:
    | {
        Id: string;
        Name: string;
      }[]
    | null;

  ReleaseDate?: string | null;

  Playtime: number;

  LastActivity?: string | null;
  Added?: string | null;
  InstallDirectory?: string | null;

  IsInstalled: boolean;

  BackgroundImage?: string | null;
  CoverImage?: string | null;
  Icon?: string | null;

  Hidden: boolean;

  CompletionStatus?: {
    Id: string;
    Name: string;
  } | null;

  ContentHash: string;
};

export type SyncGamesCommand = {
  payload: {
    toAdd: SyncGamesCommandItem[];
    toRemove: string[];
    toUpdate: SyncGamesCommandItem[];
    total: number;
  };
};

export const makeSyncGamesCommand = (
  requestDto: SyncGamesRequestDto
): SyncGamesCommand => {
  return {
    payload: {
      toAdd: requestDto.AddedItems,
      toRemove: requestDto.RemovedItems,
      toUpdate: requestDto.UpdatedItems,
      total:
        requestDto.AddedItems.length +
        requestDto.RemovedItems.length +
        requestDto.UpdatedItems.length,
    },
  };
};

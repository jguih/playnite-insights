import { PlayAtlasApiGameLibrary } from "./bootstrap.game-library";
import { PlayAtlasApiInfra } from "./bootstrap.infra";

export type PlayAtlasApi = {
  infra: PlayAtlasApiInfra;
  gameLibrary: PlayAtlasApiGameLibrary;
};

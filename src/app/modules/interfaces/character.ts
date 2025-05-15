import { Actor } from "./actor";

export interface Character{
  id: number;
  txCharacterName: string;
  tpCharacterStatus: string;
  tpCharacterType: string;
  nuFirstEpisode: number;
  txOrigin: string;
  txAge: string;
  txBiography: string;
  txCharacterPicture: string;
  actor: Actor;
}

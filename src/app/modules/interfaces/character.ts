import { Actor } from "./actor";
import { Serie } from "./serie";

export interface Character{
  id: number;
  txCharacterName: string;
  tpCharacterStatus: string;
  tpCharacterType: string;
  actor: Actor;
  nuFirstEpisode: number;
  txOrigin: string;
  txAge: string;
  txBiography: string;
  txCharacterPicture: string;
  series: Serie[];
}

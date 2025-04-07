import { Character } from './character';
import { Actor } from "./actor";
import { Episode } from "./episode";

export interface Serie {
  id: number;
  txSeriesName: string;
  director: Actor;
  nuEpisode: number;
  dtLaunch: string;
  dtClosure: string;
  tpActive: boolean;
  nuAgeClassification: number;
  txResume: string;
  txDescription: string;
  txPictureBanner: string;
  txPicturePoster: string;
  txPictureThumbnail: string;
  actorsFirstSeries?: Actor[];
  episodes?: Episode[];
  actors?: Actor[];
  characters?: Character[] ;
}

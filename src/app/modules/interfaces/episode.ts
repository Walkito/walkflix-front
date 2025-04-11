import { Serie } from "./serie";

export interface Episode{
  id: number;
  nuEpisode: number;
  txEpisodeName: string;
  txResume: string;
  txEpisodePicture: string;
  dtRelease: Date;
  nuDuration: number;
  idSeries: number
}

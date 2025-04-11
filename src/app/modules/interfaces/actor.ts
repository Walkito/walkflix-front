import { Character } from "./character";
import { Serie } from "./serie";

export interface Actor{
  id: number;
  txActorName: string;
  txActorSurname: string;
  status: string;
  dtBirthday: Date;
  txCity: string;
  txProfilePicture: string;
  txBiography: string;
}

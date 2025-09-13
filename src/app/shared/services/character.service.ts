import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { Actor } from 'app/modules/interfaces/actor';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Character } from 'app/modules/interfaces/character';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { Serie } from 'app/modules/interfaces/serie';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiPath = `${environment.apiUrl}character`;
  #http = inject(HttpClient);

  createCharacter(character: Character): Observable<ApiResponse> {
    return this.#http.post<ApiResponse>(`${this.apiPath}`, character);
  }

  editCharacter(id: number, payload: Character): Observable<ApiResponse> {
    const params: HttpParams = new HttpParams().set('id', id);

    return this.#http.put<ApiResponse>(`${this.apiPath}`, payload, { params })
  }
  
  uploadCharacterImage(path: string, id: number, imageDTO: ImageDTO): Observable<ApiResponse> {
    const params: HttpParams = new HttpParams().set('path', path).set('id', id);

    return this.#http.post<ApiResponse>(`${this.apiPath}/upload`, imageDTO, { params });
  }

  searchCharacters(id: number, characterName: string, series: Serie[], actors: Actor[]) : Observable<ApiResponse> {
    let params: HttpParams = new HttpParams().set('id', id).set('characterName', characterName);

    if (series && series.length > 0) {
      series.forEach(series => {
        params = params.append('series', series.id);
      });
    } else {
      params = params.append('series', 0);
    }

    if (actors && actors.length > 0) {
      actors.forEach(actor => {
        params = params.append('actors', actor.id);
      });
    } else {
      params = params.append('actors', 0);
    }

    return this.#http.get<ApiResponse>(`${this.apiPath}`, { params });
  }
}

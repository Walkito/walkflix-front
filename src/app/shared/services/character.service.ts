import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Character } from 'app/modules/interfaces/character';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
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

  uploadCharacterImage(path: string, id: number, imageDTO: ImageDTO): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('path', path).set('id', id);

    return this.#http.post<ApiResponse>(`${this.apiPath}/character/upload`, imageDTO, { params });
  }
}

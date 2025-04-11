import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { Episode } from 'app/modules/interfaces/episode';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {
  private apiPath = `${environment.apiUrl}episode`;

  #http = inject(HttpClient);

  getAllEpisodes(idSeries: number): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('idSeries', idSeries);

    return this.#http.get<ApiResponse>(`${this.apiPath}/series`, { params });
  }

  createEpisode(payload: Episode): Observable<ApiResponse>{
    return this.#http.post<ApiResponse>(`${this.apiPath}`, payload);
  }

  uploadActorPicture(path: string, id: number, imageDTO: ImageDTO): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('path', path).set('id', id);

    return this.#http.post<ApiResponse>(`${this.apiPath}/upload`, imageDTO, { params });
  }
}

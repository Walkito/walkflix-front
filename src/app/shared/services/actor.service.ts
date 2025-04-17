import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { Actor } from 'app/modules/interfaces/actor';
import { ApiResponse } from 'app/modules/interfaces/api-response';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { Serie } from 'app/modules/interfaces/serie';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActorService {
  private apiPath = `${environment.apiUrl}actor`;
  #http = inject(HttpClient);

  findAllDirectors(): Observable<ApiResponse>{
    return this.#http.get<ApiResponse>(`${this.apiPath}/directors`);
  }

  findDirectorBySerie(serieId: number): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('serieId', serieId);
    return this.#http.get<ApiResponse>(`${this.apiPath}/director`, { params });
  }

  findActorsWithFilter(id: number, txActorName: string, series: Serie[]): Observable<ApiResponse>{
    let params : HttpParams = new HttpParams().set('id', id).set('txActorName', txActorName);

    if (series && series.length > 0) {
      series.forEach(series=> {
        params = params.append('series', series.id);
      });
    } else {
      params = params.append('series', 0);
    }

    return this.#http.get<ApiResponse>(`${this.apiPath}/filter`, { params });
  }

  createActor(payload: Actor): Observable<ApiResponse>{
    return this.#http.post<ApiResponse>(`${this.apiPath}`, payload);
  }

  uploadProfilePicture(id: number, imageDTO: ImageDTO): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('id', id);

    return this.#http.post<ApiResponse>(`${this.apiPath}/upload`, imageDTO, { params });
  }
}

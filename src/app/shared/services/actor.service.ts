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

  getAllDirectors(): Observable<ApiResponse>{
    return this.#http.get<ApiResponse>(`${this.apiPath}/directors`);
  }

  getActor(id: number, txActorName: string, series: Serie[]): Observable<ApiResponse>{
    let params : HttpParams = new HttpParams().set('id', id).set('txActorName', txActorName);

    if (series && series.length > 0) {
      series.forEach(series=> {
        params = params.append('series', series.id);
      });
    } else {
      params = params.append('series', 0);
    }

    return this.#http.get<ApiResponse>(`${this.apiPath}`, { params });
  }

  getActorSeries(id: number): Observable<ApiResponse>{
    const params: HttpParams = new HttpParams().set('id', id).set('id', id);

    return this.#http.get<ApiResponse>(`${this.apiPath}/actorSeries`, { params });
  }

  createActor(payload: Actor): Observable<ApiResponse>{
    return this.#http.post<ApiResponse>(`${this.apiPath}`, payload);
  }

  editActor(id: number, payload: Actor): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('id', id);

    return this.#http.put<ApiResponse>(`${this.apiPath}`, payload, { params });
  }

  deleteActor(id:number): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('id', id);

    return this.#http.delete<ApiResponse>(`${this.apiPath}`, { params });
  }

  uploadProfilePicture(path: string, id: number, imageDTO: ImageDTO): Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('id', id).set('path', path);

    return this.#http.post<ApiResponse>(`${this.apiPath}/upload`, imageDTO, { params });
  }
}

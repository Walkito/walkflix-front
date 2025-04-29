import { ApiResponse } from './../../modules/interfaces/api-response';
import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { Actor } from 'app/modules/interfaces/actor';
import { ImageDTO } from 'app/modules/interfaces/image-dto';
import { Serie } from 'app/modules/interfaces/serie';
import { Observable, shareReplay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SeriesService {
  private apiPath = `${environment.apiUrl}series`;

  #http = inject(HttpClient);

  getSeries(id: number, seriesName: string, directors: Actor[], dto: number) {
    let params: HttpParams = new HttpParams().set('id', id).set('seriesName', seriesName).set('dto', dto);

    if (directors && directors.length > 0) {
      directors.forEach(director => {
        params = params.append('directors', director.id);
      });
    } else {
      params = params.append('directors', 0);
    }

    return this.#http.get<ApiResponse>(`${this.apiPath}`, { params });
  }

  createSeries(serie: Serie) : Observable<ApiResponse>{
    return this.#http.post<ApiResponse>(`${this.apiPath}`, serie);
  }

  editSeries(id: number, serie: Serie) : Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('id', id);

    return this.#http.put<ApiResponse>(`${this.apiPath}`, serie, { params });
  }

  deleteSeries(id:number): Observable<ApiResponse>{
    const params: HttpParams = new HttpParams().set('id', id);
    return this.#http.delete<ApiResponse>(`${this.apiPath}`, { params });
  }

  uploadSeriesPicture(path:string, id:number, option: string, image : ImageDTO) : Observable<ApiResponse>{
    const params : HttpParams = new HttpParams().set('path', path).set('id', id).set('option', option);

    return this.#http.post<ApiResponse>(`${this.apiPath}/upload`, image, { params });
  }
}

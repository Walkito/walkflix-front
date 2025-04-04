import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { ApiResponse } from 'app/modules/interfaces/api-response';
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
}

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';
import { ApiResponse } from 'app/modules/interfaces/api-response';
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
}

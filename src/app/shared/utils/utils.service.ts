import { DatePipe } from "@angular/common";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "app/environments/environment";
import { read, stat } from "fs";
import { BehaviorSubject, Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class Utils {
  constructor(private datePipe: DatePipe, private http: HttpClient) { }
  private apiPath = `${environment.apiUrl}`;

  formatDate(apiDate: string): string {
    return this.datePipe.transform(apiDate, 'dd/MM/yyyy') || '';
  }

  formatDateDb(apiDate: string): string {
    return this.datePipe.transform(apiDate, 'yyyy-MM-dd') || '';
  }

  downloadAndConvertToBase64(path: string) : Observable<Blob> {
    const params : HttpParams = new HttpParams().set('path', path);

    return this.http.get(`${this.apiPath}image`,  { responseType: 'blob', params })
  }
}

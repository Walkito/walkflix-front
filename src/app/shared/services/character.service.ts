import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from 'app/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CharacterService {
  private apiPath = `${environment.apiUrl}actor`;
  #http = inject(HttpClient);


}

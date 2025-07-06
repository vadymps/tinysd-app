import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient)

  getData() {
    return this.http.get('http://localhost:3000/api');
  }
}
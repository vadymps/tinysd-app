import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Log {
  _id?: string;
  referer: string;
  datetime: number;
}

@Injectable({ providedIn: 'root' })
export class LogService {
  private readonly baseUrl = '/api/logs';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Log[]> {
    return this.http.get<Log[]>(`${this.baseUrl}/`);
  }

  getById(id: string): Observable<Log> {
    return this.http.get<Log>(`${this.baseUrl}/${id}`);
  }

  create(log: Omit<Log, '_id'>): Observable<Log> {
    return this.http.post<Log>(`${this.baseUrl}/`, log);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

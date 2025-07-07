import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SavedImage {
  id: string;
  filename: string;
  originalUrl: string;
  prompt: string;
  savedAt: Date;
  localPath: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImageService {
  private apiUrl = '/api/image';

  constructor(private http: HttpClient) { }

  generateImage(prompt: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/generate`, { prompt });
  }

  saveImage(imageUrl: string, prompt: string): Observable<SavedImage> {
    return this.http.post<SavedImage>(`${this.apiUrl}/save`, { imageUrl, prompt });
  }

  getSavedImages(): Observable<SavedImage[]> {
    return this.http.get<SavedImage[]>(`${this.apiUrl}/saved`);
  }

  deleteSavedImage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/saved/${id}`);
  }
}

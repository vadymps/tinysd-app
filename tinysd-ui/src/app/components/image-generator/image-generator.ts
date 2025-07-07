import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-image-generator',
  templateUrl: './image-generator.html',
  styleUrls: ['./image-generator.scss'],
})
export class ImageGeneratorComponent {
  prompt = '';
  imageUrl: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  onPromptChange(event: Event) {
    this.prompt =
      event.target instanceof HTMLTextAreaElement ? event.target.value : '';
  }

  generateImage() {
    this.loading = true;
    this.error = null;
    this.imageUrl = null;
    this.http
      .post<any>('/api/image/generate', { prompt: this.prompt })
      .subscribe({
        next: (res) => {
          this.imageUrl = res?.output?.[0] || null;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.error || 'Failed to generate image';
          this.loading = false;
        },
      });
  }
}

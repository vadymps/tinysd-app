import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-image-generator',
  templateUrl: './image-generator.html',
  styleUrls: ['./image-generator.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
  ],
})
export class ImageGeneratorComponent {
  form: FormGroup;
  imageUrl: string | null = null;
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient, private fb: FormBuilder) {
    this.form = this.fb.group({
      prompt: ['', Validators.required],
    });
  }

  generateImage() {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = null;
    this.imageUrl = null;
    const prompt = this.form.value.prompt;
    this.http.post<any>('/api/image/generate', { prompt }).subscribe({
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

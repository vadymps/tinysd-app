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
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { ImageService } from '../../services/image.service';

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
    MatSnackBarModule,
  ],
})
export class ImageGeneratorComponent {
  form: FormGroup;
  imageUrl: string | null = null;
  loading = false;
  saving = false;
  error: string | null = null;
  currentPrompt: string = '';

  constructor(
    private http: HttpClient, 
    private fb: FormBuilder,
    private imageService: ImageService,
    private snackBar: MatSnackBar
  ) {
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
    this.currentPrompt = prompt;
    
    this.imageService.generateImage(prompt).subscribe({
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

  saveImage() {
    if (!this.imageUrl || !this.currentPrompt) return;
    
    this.saving = true;
    this.imageService.saveImage(this.imageUrl, this.currentPrompt).subscribe({
      next: (savedImage) => {
        this.saving = false;
        this.snackBar.open('Image saved successfully!', 'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open('Failed to save image', 'Close', {
          duration: 3000,
        });
      },
    });
  }
}

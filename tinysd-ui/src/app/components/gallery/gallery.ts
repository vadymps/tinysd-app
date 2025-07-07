import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ImageService, SavedImage } from '../../services/image.service';

@Component({
  selector: 'app-gallery',
  templateUrl: './gallery.html',
  styleUrls: ['./gallery.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
})
export class GalleryComponent implements OnInit {
  savedImages: SavedImage[] = [];
  loading = false;

  constructor(
    private imageService: ImageService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadImages();
  }

  loadImages() {
    this.loading = true;
    this.imageService.getSavedImages().subscribe({
      next: (images) => {
        this.savedImages = images;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.snackBar.open('Failed to load images', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  deleteImage(imageId: string) {
    this.imageService.deleteSavedImage(imageId).subscribe({
      next: () => {
        this.savedImages = this.savedImages.filter((img) => img.id !== imageId);
        this.snackBar.open('Image deleted successfully!', 'Close', {
          duration: 3000,
        });
      },
      error: (err) => {
        this.snackBar.open('Failed to delete image', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  openImage(imagePath: string) {
    window.open(imagePath, '_blank');
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString();
  }
}

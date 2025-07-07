import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'welcome',
  template: `
    <div class="text-center py-12">
      <h2 class="text-4xl font-bold text-gray-800 mb-4">Welcome to TinySD UI</h2>
      <p class="text-lg text-gray-600 mb-8">
        Generate AI images and manage your collection
      </p>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <mat-icon class="text-5xl text-blue-600 mb-4">auto_awesome</mat-icon>
          <h3 class="text-xl font-semibold mb-2">Generate Images</h3>
          <p class="text-gray-600 mb-4">Create stunning AI-generated images from text prompts</p>
          <button mat-raised-button color="primary" routerLink="/image-generator">
            Get Started
          </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <mat-icon class="text-5xl text-purple-600 mb-4">photo_library</mat-icon>
          <h3 class="text-xl font-semibold mb-2">View Gallery</h3>
          <p class="text-gray-600 mb-4">Browse and manage your saved images</p>
          <button mat-raised-button color="accent" routerLink="/gallery">
            View Gallery
          </button>
        </div>
        
        <div class="bg-white rounded-lg shadow-md p-6 text-center">
          <mat-icon class="text-5xl text-green-600 mb-4">article</mat-icon>
          <h3 class="text-xl font-semibold mb-2">View Logs</h3>
          <p class="text-gray-600 mb-4">Monitor system activity and generation logs</p>
          <button mat-raised-button color="primary" routerLink="/logs">
            View Logs
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule],
})
export class WelcomeComponent {}

import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout';
import { ImageGeneratorComponent } from './components/image-generator/image-generator';
import { GalleryComponent } from './components/gallery/gallery';
import { WelcomeComponent } from './components/welcome/welcome';
import { AboutComponent } from './components/about/about';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: WelcomeComponent },
      { path: 'image-generator', component: ImageGeneratorComponent },
      { path: 'gallery', component: GalleryComponent },
      { path: 'about', component: AboutComponent },
    ],
  },
];

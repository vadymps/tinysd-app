import { Routes } from '@angular/router';
import { MainLayoutComponent } from './components/main-layout/main-layout';
import { LogsComponent } from './components/logs/logs';
import { ImageGeneratorComponent } from './components/image-generator/image-generator';
import { WelcomeComponent } from './components/welcome/welcome';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [{ path: '', component: WelcomeComponent }],
  },
  {
    path: 'logs',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: LogsComponent,
      },
    ],
  },
  {
    path: 'image-generator',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        component: ImageGeneratorComponent,
      },
    ],
  },
];

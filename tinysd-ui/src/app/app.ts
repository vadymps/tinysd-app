import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {
  MatSidenavContainer,
  MatSidenav,
  MatSidenavContent,
} from '@angular/material/sidenav';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  imports: [MatSidenavContainer, MatSidenav, MatSidenavContent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  animations: [
    trigger('fadeAnimation', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('300ms', style({ opacity: 1 })),
      ]),
      transition(':leave', [animate('300ms', style({ opacity: 0 }))]),
    ]),
  ],
})
export class App {
  protected title = 'tinysd-ui';
}

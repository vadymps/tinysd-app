import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenavContainer, MatSidenav, MatSidenavContent } from '@angular/material/sidenav';

@Component({
  selector: 'app-root',
  imports: [MatSidenavContainer, MatSidenav, MatSidenavContent, RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected title = 'tinysd-ui';
}

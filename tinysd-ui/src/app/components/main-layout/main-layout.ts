import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'main-layout',
  templateUrl: `./main-layout.html`,
  styleUrls: ['./main-layout.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatCard, MatButton, MatIconModule],
})
export class MainLayoutComponent {}

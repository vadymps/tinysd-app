import { Component } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'main-layout',
  templateUrl: `./main-layout.html`,
  styleUrls: ['./main-layout.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatCard, MatButton],
})
export class MainLayoutComponent {}

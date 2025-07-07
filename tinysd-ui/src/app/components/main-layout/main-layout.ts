import { Component } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'main-layout',
  templateUrl: `./main-layout.html`,
  styleUrls: ['./main-layout.scss'],
  standalone: true,
  imports: [RouterOutlet, RouterLink, MatCard],
})
export class MainLayoutComponent {}

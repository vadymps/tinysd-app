import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'main-layout',
  templateUrl: `./main-layout.html`,
  styles: [],
  standalone: true,
  imports: [RouterOutlet, RouterLink],
})
export class MainLayoutComponent {}

import { Component } from '@angular/core';
import { LogsComponent } from '../logs/logs';

@Component({
  selector: 'main-layout',
  templateUrl: `./main-layout.html`,
  styles: [],
  standalone: true,
  imports: [LogsComponent],
})
export class MainLayoutComponent {}

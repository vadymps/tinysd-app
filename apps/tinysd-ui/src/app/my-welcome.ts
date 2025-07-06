import { Component, inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from './api-service';

@Component({
  selector: 'app-my-welcome',
  imports: [CommonModule],
  template: `<div
    style="display: flex; justify-content: center; align-items: center;"
  >
    <div>{{ data.message }}</div>
  </div> `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class MyWelcome implements OnInit {
  private apiService = inject(ApiService);

  data: any;

  ngOnInit() {
    this.apiService.getData().subscribe((response) => {
      this.data = response;
    });
  }
}

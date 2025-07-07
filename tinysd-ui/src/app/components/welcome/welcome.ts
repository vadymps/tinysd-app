import { Component } from '@angular/core';

@Component({
  selector: 'welcome',
  template: `
    <div
      style="text-align:center; color:#888; font-size:1.2rem;"
    >
      <p>Welcome! Please select a feature from above.</p>
    </div>
  `,
  standalone: true,
})
export class WelcomeComponent {}

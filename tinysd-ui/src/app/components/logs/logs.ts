import { Component, OnInit } from '@angular/core';
import { LogService, Log } from '../../services/log.service';

@Component({
  selector: 'logs',
  templateUrl: './logs.html',
  styles: [],
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];

  constructor(private logService: LogService) {}

  ngOnInit() {
    const log = {
      referer: window.location.href,
      datetime: Date.now(),
    };

    this.logService.create(log).subscribe({
      next: () => {
        this.loadLogs();
      },
      error: (err) => {
        console.error('Log create error:', err);
      },
    });
  }

  loadLogs() {
    this.logService.getAll().subscribe((logs) => (this.logs = logs));
  }

  deleteLog(id: string) {
    this.logService.delete(id).subscribe(() => this.loadLogs());
  }
}

import { Component, OnInit } from '@angular/core';
import { LogService, Log } from '../../services/log.service';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'logs',
  templateUrl: './logs.html',
  styleUrls: ['./logs.scss'],
  imports: [MatIconButton, MatIcon, TitleCasePipe],
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];

  constructor(private logService: LogService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.logService.getAll().subscribe((logs) => {
      // Sort logs by datetime (newest first)
      this.logs = logs.sort((a, b) => b.datetime - a.datetime);
    });
  }

  deleteLog(id: string) {
    this.logService.delete(id).subscribe(() => this.loadLogs());
  }

  formatTimestamp(timestamp: number): string {
    return new Date(timestamp).toLocaleString();
  }
}

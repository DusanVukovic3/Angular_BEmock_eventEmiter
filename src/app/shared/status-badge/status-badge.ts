import { Component, input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  imports: [NgClass],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
})
export class StatusBadge {
  status = input.required<string>();
}

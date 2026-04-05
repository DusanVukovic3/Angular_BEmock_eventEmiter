import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-message',
  imports: [],
  templateUrl: './error-message.html',
  styleUrl: './error-message.scss',
})
export class ErrorMessage {
  message = input.required<string>();
  retry = output<void>();
}

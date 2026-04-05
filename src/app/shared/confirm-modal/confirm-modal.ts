import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  imports: [],
  templateUrl: './confirm-modal.html',
  styleUrl: './confirm-modal.scss',
})
export class ConfirmModal {
  message = input<string>('Are you sure?');
  confirmLabel = input<string>('Confirm');
  result = output<boolean>(); //  True dinamicki, false za cancel
}

import { Component, OnDestroy, effect, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-floating-notification',
  imports: [],
  templateUrl: './floating-notification.html',
  styleUrl: './floating-notification.scss',
})
export class FloatingNotification implements OnDestroy {
  message = input<string | null>(null);
  type = input<'success' | 'info' | 'warning'>('info');
  dismissed = output<void>();

  visible = signal(false);

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      const msg = this.message();
      if (msg) {
        this.visible.set(true);
        if (this.timer) clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.visible.set(false);
          this.dismissed.emit();
        }, 3000);
      } else {
        this.visible.set(false);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.timer) clearTimeout(this.timer);
  }
}

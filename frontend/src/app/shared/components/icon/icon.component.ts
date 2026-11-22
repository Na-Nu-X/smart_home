import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICONS } from './icons';

/** Inline stroke icon: `<app-icon name="lighting" />`. Decorative by default. */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <svg
      [attr.class]="'icon icon--' + name()"
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : null"
      [attr.aria-label]="label() || null"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly label = input<string>('');
  readonly strokeWidth = input<number>(1.6);

  protected readonly paths = computed(() => ICONS[this.name()] ?? ICONS['sparkle']);
}

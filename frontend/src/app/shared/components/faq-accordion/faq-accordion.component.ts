import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { FaqItem } from '../../../core/data/content';
import { IconComponent } from '../icon/icon.component';

/** Accessible accordion (button + region, single item open at a time). */
@Component({
  selector: 'app-faq-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent],
  template: `
    <div class="faq">
      @for (item of items(); track item.question; let i = $index) {
        <div class="faq__item" [class.is-open]="openIndex() === i">
          <h3 class="faq__heading">
            <button
              type="button"
              class="faq__trigger"
              [id]="'faq-trigger-' + i"
              [attr.aria-expanded]="openIndex() === i"
              [attr.aria-controls]="'faq-panel-' + i"
              (click)="toggle(i)"
            >
              <span>{{ item.question }}</span>
              <span class="faq__icon" aria-hidden="true"><app-icon [name]="openIndex() === i ? 'minus' : 'plus'" /></span>
            </button>
          </h3>
          <div class="faq__panel" [id]="'faq-panel-' + i" role="region" [attr.aria-labelledby]="'faq-trigger-' + i">
            <div class="faq__panel-inner">
              <p>{{ item.answer }}</p>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .faq {
      border-top: 1px solid var(--color-border);
    }
    .faq__item {
      border-bottom: 1px solid var(--color-border);
    }
    .faq__heading {
      font-family: var(--font-sans);
      font-size: inherit;
      font-weight: inherit;
      letter-spacing: 0;
    }
    .faq__trigger {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      width: 100%;
      padding: 1.4rem 0;
      text-align: left;
      font-family: var(--font-serif);
      font-size: clamp(1.1rem, 1rem + 0.4vw, 1.3rem);
      line-height: 1.35;
      color: var(--color-ink);
    }
    .faq__trigger:hover {
      color: var(--color-accent-ink);
    }
    .faq__icon {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: 1px solid var(--color-border-strong);
      transition: background-color var(--duration-base), border-color var(--duration-base), color var(--duration-base);
    }
    .faq__icon ::ng-deep svg {
      width: 16px;
      height: 16px;
    }
    .is-open .faq__icon {
      background: var(--color-ink);
      border-color: var(--color-ink);
      color: var(--color-on-dark);
    }
    .faq__panel {
      display: grid;
      grid-template-rows: 0fr;
      transition: grid-template-rows var(--duration-base) var(--ease-out);
    }
    .is-open .faq__panel {
      grid-template-rows: 1fr;
    }
    .faq__panel-inner {
      overflow: hidden;
      visibility: hidden;
      transition: visibility var(--duration-base);
    }
    .is-open .faq__panel-inner {
      visibility: visible;
    }
    .faq__panel p {
      max-width: 64ch;
      padding-bottom: 1.5rem;
      color: var(--color-ink-2);
    }
  `,
})
export class FaqAccordionComponent {
  readonly items = input.required<FaqItem[]>();
  protected readonly openIndex = signal<number | null>(0);

  protected toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}

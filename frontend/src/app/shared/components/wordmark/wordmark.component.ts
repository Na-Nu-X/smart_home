import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SITE_CONFIG } from '../../../core/config/site.config';

/** Typographic company wordmark driven by `site.config.ts`. */
@Component({
  selector: 'app-wordmark',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="wordmark" [class.wordmark--light]="light()">
      <span class="wordmark__mark" aria-hidden="true">
        <svg viewBox="0 0 32 32" width="32" height="32">
          <path d="M6 15.5 16 7l10 8.5V25a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 6 25Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
          <circle cx="16" cy="18.5" r="3" fill="var(--color-accent)" />
        </svg>
      </span>
      <span class="wordmark__text">
        <span class="wordmark__primary">{{ config.company.wordmark.primary }}</span>
        <span class="wordmark__secondary">{{ config.company.wordmark.secondary }}</span>
      </span>
    </span>
  `,
  styles: `
    .wordmark {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--color-ink);
      line-height: 1;
    }
    .wordmark--light {
      color: var(--color-on-dark);
    }
    .wordmark__mark svg {
      width: 30px;
      height: 30px;
    }
    .wordmark__text {
      display: inline-flex;
      align-items: baseline;
      gap: 0.3rem;
      font-size: 1.32rem;
    }
    .wordmark__primary {
      font-family: var(--font-sans);
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .wordmark__secondary {
      font-family: var(--font-serif);
      font-style: italic;
      font-weight: 400;
    }
  `,
})
export class WordmarkComponent {
  readonly light = input(false);
  protected readonly config = SITE_CONFIG;
}

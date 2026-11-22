import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-not-found-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent],
  template: `
    <section class="section">
      <div class="container--narrow wrap">
        <p class="code num">404</p>
        <h1 class="h2">Táto miestnosť je zatiaľ <em>neosvetlená</em>.</h1>
        <p class="lead">Stránka, ktorú hľadáte, neexistuje alebo bola presunutá.</p>
        <div class="cluster">
          <a routerLink="/" class="btn btn--primary">Späť na úvod <app-icon name="arrow-right" /></a>
          <a routerLink="/riesenia" class="btn btn--ghost">Prehľad riešení</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .wrap {
      display: grid;
      gap: 1.25rem;
      justify-items: start;
      padding-block: 3rem;
    }
    .code {
      font-family: var(--font-serif);
      font-size: clamp(5rem, 4rem + 6vw, 9rem);
      line-height: 1;
      color: var(--color-accent);
    }
  `,
})
export class NotFoundPage {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SmartHomeBudgetEstimatorComponent } from '../../shared/components/budget-estimator/budget-estimator.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-calculator-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, SmartHomeBudgetEstimatorComponent],
  template: `
    <header class="page-hero">
      <div class="container">
        <p class="eyebrow">Kalkulačka ceny Smart Home</p>
        <h1>Orientačný rozpočet <em>za 30 sekúnd</em>.</h1>
        <p class="lead">
          Nastavte typ nehnuteľnosti, plochu, fázu stavby a moduly, ktoré vás zaujímajú. Kalkulačka vypočíta
          investíciu na kľúč, odhad ročnej úspory energií a odporučí vhodnú architektúru systému.
        </p>
      </div>
    </header>

    <section class="section section--tight section--surface">
      <div class="container">
        <app-budget-estimator />
      </div>
    </section>

    <section class="section section--tight">
      <div class="container notes">
        <article>
          <app-icon name="info" />
          <h2 class="h4">Čo cena zahŕňa</h2>
          <p>Projekt, smart rozvádzač na mieru, riadiace prvky, senzory, montáž, programovanie scén a zaškolenie.</p>
        </article>
        <article>
          <app-icon name="lighting" />
          <h2 class="h4">Čo cena nezahŕňa</h2>
          <p>Dekoratívne svietidlá, motory žalúzií, fotovoltiku a stavebné práce – tie oceníme podľa vášho výberu.</p>
        </article>
        <article>
          <app-icon name="calendar" />
          <h2 class="h4">Presná ponuka</h2>
          <p>
            Po konzultácii a analýze pôdorysu dostanete presný rozpočet.
            <a routerLink="/konzultacia" class="text-link">Požiadať o ponuku</a>
          </p>
        </article>
      </div>
    </section>
  `,
  styles: `
    .notes {
      display: grid;
      gap: 1rem;
    }
    @media (min-width: 768px) {
      .notes {
        grid-template-columns: repeat(3, 1fr);
      }
    }
    article {
      display: grid;
      gap: 0.6rem;
      align-content: start;
      padding: 1.5rem;
      border-radius: var(--radius-card);
      border: 1px solid var(--color-border);
    }
    article ::ng-deep svg {
      width: 24px;
      height: 24px;
      color: var(--color-accent);
    }
    p {
      font-size: 0.92rem;
      color: var(--color-ink-2);
    }
  `,
})
export class CalculatorPage {}

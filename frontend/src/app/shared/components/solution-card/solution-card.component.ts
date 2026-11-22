import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SmartSolution } from '../../../core/models/api.models';
import { EurPipe, ImgPipe } from '../../pipes/format.pipes';
import { IconComponent } from '../icon/icon.component';

const MAX_PROTOCOLS = 3;

/** Architectural card for a functional smart home solution. */
@Component({
  selector: 'app-solution-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, EurPipe, ImgPipe],
  template: `
    @let s = solution();
    <article class="card">
      <div class="card__media">
        <img [src]="s.cover_image_url | img: 800" [alt]="s.name" loading="lazy" decoding="async" width="800" height="600" />
        <span class="tag tag--on-dark card__domain">
          <app-icon [name]="s.domain.icon_name" /> {{ s.domain.name }}
        </span>
      </div>
      <div class="card__body">
        <h3 class="card__title">
          <a [routerLink]="['/riesenia', s.slug]" class="card__link">{{ s.name }}</a>
        </h3>
        <p class="card__desc">{{ s.short_description }}</p>

        <ul class="card__protocols" role="list" aria-label="Podporované protokoly">
          @for (protocol of visibleProtocols(); track protocol) {
            <li class="tag tag--protocol">{{ protocol }}</li>
          }
          @if (hiddenProtocols() > 0) {
            <li class="tag tag--outline">+{{ hiddenProtocols() }}</li>
          }
        </ul>

        @if (s.energy_saving_note) {
          <p class="card__energy"><app-icon name="leaf" /> {{ s.energy_saving_note }}</p>
        }

        <div class="card__footer">
          @if (s.starting_price_eur) {
            <p class="card__price">
              <span>od</span> <strong class="num">{{ s.starting_price_eur | eur }}</strong>
            </p>
          } @else {
            <p class="card__price"><span>Cena na vyžiadanie</span></p>
          }
          <span class="card__arrow" aria-hidden="true"><app-icon name="arrow-up-right" /></span>
        </div>
      </div>
    </article>
  `,
  styleUrl: './solution-card.component.scss',
})
export class SolutionCardComponent {
  readonly solution = input.required<SmartSolution>();

  protected readonly visibleProtocols = computed(() => this.solution().supported_protocols.slice(0, MAX_PROTOCOLS));
  protected readonly hiddenProtocols = computed(() =>
    Math.max(0, this.solution().supported_protocols.length - MAX_PROTOCOLS),
  );
}

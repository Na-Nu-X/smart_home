import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { describeProtocol } from '../../core/data/protocols';
import { DOMAIN_ICON_TO_MODULE } from '../../core/data/smart-modules';
import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SolutionCardComponent } from '../../shared/components/solution-card/solution-card.component';
import { EurPipe, ImgPipe } from '../../shared/pipes/format.pipes';

@Component({
  selector: 'app-solution-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, SolutionCardComponent, EurPipe, ImgPipe],
  templateUrl: './solution-detail.page.html',
  styleUrl: './solution-detail.page.scss',
})
export class SolutionDetailPage {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);

  readonly slug = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => toLoadState(this.catalog.getSolution(slug)))),
    { initialValue: { status: 'loading' } as const },
  );

  protected readonly solution = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.data : null;
  });

  protected readonly paragraphs = computed(
    () => this.solution()?.detailed_description.split(/\n{2,}/).filter((p) => p.trim()) ?? [],
  );

  protected readonly protocols = computed(
    () => this.solution()?.supported_protocols.map((name) => ({ name, note: describeProtocol(name) })) ?? [],
  );

  /** Query params that pre-fill the consultation wizard with this solution. */
  protected readonly quoteParams = computed(() => {
    const solution = this.solution();
    if (!solution) {
      return {};
    }
    return {
      goal: 'cenova_ponuka',
      modules: DOMAIN_ICON_TO_MODULE[solution.domain.icon_name] ?? null,
      solution: solution.name,
    };
  });

  constructor() {
    effect(() => {
      const solution = this.solution();
      if (solution) {
        this.seo.update(solution.name, solution.short_description, solution.cover_image_url);
      }
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { TRUST_HIGHLIGHTS, WHY_US_PILLARS } from '../../core/data/content';
import { SolutionDomain } from '../../core/models/api.models';
import { CatalogService } from '../../core/services/catalog.service';
import { toLoadState } from '../../core/utils/load-state';
import { SmartHomeBudgetEstimatorComponent } from '../../shared/components/budget-estimator/budget-estimator.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ReferenceCardComponent } from '../../shared/components/reference-card/reference-card.component';
import { EurPipe, ImgPipe } from '../../shared/pipes/format.pipes';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=2000&q=80';

@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ReferenceCardComponent, SmartHomeBudgetEstimatorComponent, ImgPipe, EurPipe],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly catalog = inject(CatalogService);

  protected readonly config = SITE_CONFIG;
  protected readonly trustHighlights = TRUST_HIGHLIGHTS;
  protected readonly pillars = WHY_US_PILLARS;
  protected readonly heroImage = HERO_IMAGE;

  protected readonly domainsState = toSignal(toLoadState(this.catalog.getDomains()), {
    initialValue: { status: 'loading' } as const,
  });
  protected readonly solutions = toSignal(this.catalog.getSolutions(), { initialValue: [] });
  protected readonly referencesState = toSignal(toLoadState(this.catalog.getReferences({ featured: true })), {
    initialValue: { status: 'loading' } as const,
  });

  protected readonly domains = computed(() => {
    const state = this.domainsState();
    return state.status === 'success' ? state.data : [];
  });

  protected readonly featuredReferences = computed(() => {
    const state = this.referencesState();
    return state.status === 'success' ? state.data.slice(0, 4) : [];
  });

  /** Currently highlighted domain in the interactive grid. */
  protected readonly selectedSlug = signal<string | null>(null);

  protected readonly activeDomain = computed<SolutionDomain | null>(() => {
    const domains = this.domains();
    return domains.find((d) => d.slug === this.selectedSlug()) ?? domains[0] ?? null;
  });

  protected readonly activeSolutions = computed(() => {
    const domain = this.activeDomain();
    return domain ? this.solutions().filter((s) => s.domain.slug === domain.slug) : [];
  });

  protected readonly activeImage = computed(() => this.activeSolutions()[0]?.cover_image_url ?? '');

  protected selectDomain(slug: string): void {
    this.selectedSlug.set(slug);
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { CatalogService, SolutionQuery } from '../../core/services/catalog.service';
import { toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SolutionCardComponent } from '../../shared/components/solution-card/solution-card.component';

interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-solutions-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, SolutionCardComponent],
  templateUrl: './solutions.page.html',
  styleUrl: './solutions.page.scss',
})
export class SolutionsPage {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  /** Query params (bound via withComponentInputBinding). */
  readonly domain = input<string | undefined>();
  readonly q = input<string | undefined>();

  protected readonly sortOptions: SortOption[] = [
    { value: '', label: 'Podľa oblasti' },
    { value: 'starting_price_eur', label: 'Cena: od najnižšej' },
    { value: '-starting_price_eur', label: 'Cena: od najvyššej' },
    { value: 'name', label: 'Názov A – Z' },
  ];

  protected readonly searchTerm = linkedSignal(() => this.q() ?? '');
  protected readonly ordering = signal('');
  protected readonly featuredOnly = signal(false);

  protected readonly domains = toSignal(this.catalog.getDomains(), { initialValue: [] });
  protected readonly totalCount = computed(() => this.domains().reduce((sum, d) => sum + d.solution_count, 0));
  protected readonly activeDomain = computed(() => this.domains().find((d) => d.slug === this.domain()) ?? null);

  private readonly query = computed<SolutionQuery>(() => ({
    domain: this.domain() ?? null,
    search: this.searchTerm().trim(),
    ordering: this.ordering(),
    featured: this.featuredOnly() || undefined,
  }));

  protected readonly state = toSignal(
    toObservable(this.query).pipe(
      debounceTime(200),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap((query) => toLoadState(this.catalog.getSolutions(query))),
    ),
    { initialValue: { status: 'loading' } as const },
  );

  protected setDomain(slug: string | null): void {
    void this.router.navigate([], {
      queryParams: { domain: slug },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected onOrdering(event: Event): void {
    this.ordering.set((event.target as HTMLSelectElement).value);
  }

  protected resetFilters(): void {
    this.searchTerm.set('');
    this.featuredOnly.set(false);
    this.ordering.set('');
    this.setDomain(null);
  }
}

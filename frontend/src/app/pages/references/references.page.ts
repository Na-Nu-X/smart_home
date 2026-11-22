import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs';

import { ReferencePropertyType } from '../../core/models/api.models';
import { CatalogService, ReferenceQuery } from '../../core/services/catalog.service';
import { toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ReferenceCardComponent } from '../../shared/components/reference-card/reference-card.component';

interface TypeFilter {
  value: ReferencePropertyType | null;
  label: string;
  icon: string;
}

const PROPERTY_TYPES: ReferencePropertyType[] = ['rodinny_dom', 'byt_penthouse', 'komercny_objekt'];

@Component({
  selector: 'app-references-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ReferenceCardComponent],
  templateUrl: './references.page.html',
  styleUrl: './references.page.scss',
})
export class ReferencesPage {
  private readonly catalog = inject(CatalogService);
  private readonly router = inject(Router);

  /** `?typ=rodinny_dom` query param. */
  readonly typ = input<string | undefined>();

  protected readonly filters: TypeFilter[] = [
    { value: null, label: 'Všetky realizácie', icon: 'layers' },
    { value: 'rodinny_dom', label: 'Rodinné domy', icon: 'home' },
    { value: 'byt_penthouse', label: 'Byty', icon: 'building' },
    { value: 'komercny_objekt', label: 'Komerčné objekty', icon: 'cpu' },
  ];

  protected readonly activeType = computed<ReferencePropertyType | null>(() => {
    const value = this.typ();
    return value && (PROPERTY_TYPES as string[]).includes(value) ? (value as ReferencePropertyType) : null;
  });

  protected readonly searchTerm = signal('');

  private readonly query = computed<ReferenceQuery>(() => ({
    property_type: this.activeType(),
    search: this.searchTerm().trim(),
  }));

  protected readonly state = toSignal(
    toObservable(this.query).pipe(
      debounceTime(200),
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
      switchMap((query) => toLoadState(this.catalog.getReferences(query))),
    ),
    { initialValue: { status: 'loading' } as const },
  );

  protected setType(value: ReferencePropertyType | null): void {
    void this.router.navigate([], { queryParams: { typ: value }, replaceUrl: true });
  }

  protected onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}

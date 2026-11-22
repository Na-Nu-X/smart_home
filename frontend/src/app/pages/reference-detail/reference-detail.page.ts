import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, HostListener, computed, effect, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { CatalogService } from '../../core/services/catalog.service';
import { SeoService } from '../../core/services/seo.service';
import { toLoadState } from '../../core/utils/load-state';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ImgPipe, NumPipe } from '../../shared/pipes/format.pipes';

const PROPERTY_TO_CONSULTATION: Record<string, string> = {
  rodinny_dom: 'rodinny_dom',
  byt_penthouse: 'byt',
  komercny_objekt: 'komercny',
};

@Component({
  selector: 'app-reference-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ImgPipe, NumPipe],
  templateUrl: './reference-detail.page.html',
  styleUrl: './reference-detail.page.scss',
})
export class ReferenceDetailPage {
  private readonly catalog = inject(CatalogService);
  private readonly seo = inject(SeoService);
  private readonly document = inject(DOCUMENT);

  readonly slug = input.required<string>();

  protected readonly state = toSignal(
    toObservable(this.slug).pipe(switchMap((slug) => toLoadState(this.catalog.getReference(slug)))),
    { initialValue: { status: 'loading' } as const },
  );

  protected readonly reference = computed(() => {
    const state = this.state();
    return state.status === 'success' ? state.data : null;
  });

  protected readonly photos = computed(() => this.reference()?.photos ?? []);

  /** Index of the photo open in the lightbox (null = closed). */
  protected readonly lightboxIndex = signal<number | null>(null);
  protected readonly lightboxPhoto = computed(() => {
    const index = this.lightboxIndex();
    return index === null ? null : (this.photos()[index] ?? null);
  });

  protected readonly similarParams = computed(() => {
    const reference = this.reference();
    return reference
      ? {
          goal: 'cenova_ponuka',
          type: PROPERTY_TO_CONSULTATION[reference.property_type] ?? null,
          area: reference.floor_area_sqm,
          reference: reference.title,
        }
      : {};
  });

  constructor() {
    effect(() => {
      const reference = this.reference();
      if (reference) {
        this.seo.update(reference.title, reference.client_vision, reference.cover_image_url);
      }
    });
    effect(() => {
      this.document.body.classList.toggle('no-scroll', this.lightboxIndex() !== null);
    });
  }

  protected openLightbox(index: number): void {
    this.lightboxIndex.set(index);
  }

  protected closeLightbox(): void {
    this.lightboxIndex.set(null);
  }

  protected step(delta: number): void {
    const count = this.photos().length;
    this.lightboxIndex.update((index) => (index === null || count === 0 ? index : (index + delta + count) % count));
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.lightboxIndex() === null) {
      return;
    }
    if (event.key === 'Escape') {
      this.closeLightbox();
    } else if (event.key === 'ArrowRight') {
      this.step(1);
    } else if (event.key === 'ArrowLeft') {
      this.step(-1);
    }
  }
}

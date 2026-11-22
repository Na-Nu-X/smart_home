import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ReferenceInstallation } from '../../../core/models/api.models';
import { ImgPipe, NumPipe } from '../../pipes/format.pipes';
import { IconComponent } from '../icon/icon.component';

/** Showcase card for a completed reference installation. */
@Component({
  selector: 'app-reference-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, ImgPipe, NumPipe],
  template: `
    @let r = reference();
    <article class="ref" [class.ref--large]="large()">
      <div class="ref__media">
        <img [src]="r.cover_image_url | img: (large() ? 1400 : 900)" [alt]="r.title" loading="lazy" decoding="async" />
        <span class="tag tag--on-dark ref__type">{{ r.property_type_display }}</span>
      </div>
      <div class="ref__body">
        <p class="ref__meta">
          <span><app-icon name="map-pin" /> {{ r.location_city }}</span>
          <span class="num"><app-icon name="area" /> {{ r.floor_area_sqm | num }} m²</span>
          @if (r.completion_year) {
            <span class="num">{{ r.completion_year }}</span>
          }
        </p>
        <h3 class="ref__title">
          <a [routerLink]="['/realizacie', r.slug]" class="ref__link">{{ r.title }}</a>
        </h3>
        <p class="ref__platform"><app-icon name="cpu" /> {{ r.system_platform }}</p>
        @if (r.measured_benefit) {
          <p class="ref__benefit"><app-icon name="leaf" /> {{ r.measured_benefit }}</p>
        }
      </div>
    </article>
  `,
  styleUrl: './reference-card.component.scss',
})
export class ReferenceCardComponent {
  readonly reference = input.required<ReferenceInstallation>();
  readonly large = input(false);
}

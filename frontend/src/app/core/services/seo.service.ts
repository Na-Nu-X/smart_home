import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

import { SITE_CONFIG } from '../config/site.config';

/** Updates document title and meta description/OG tags for dynamic pages. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(pageTitle: string, description?: string, image?: string): void {
    const fullTitle = `${pageTitle} | ${SITE_CONFIG.company.name}`;
    this.title.setTitle(fullTitle);
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    if (description) {
      const trimmed = description.length > 160 ? `${description.slice(0, 157)}…` : description;
      this.meta.updateTag({ name: 'description', content: trimmed });
      this.meta.updateTag({ property: 'og:description', content: trimmed });
    }
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
    }
  }
}

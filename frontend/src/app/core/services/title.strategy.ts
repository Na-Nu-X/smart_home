import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SITE_CONFIG } from '../config/site.config';

/** Appends the company name to every route title. */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    const company = SITE_CONFIG.company.name;
    this.title.setTitle(pageTitle ? `${pageTitle} | ${company}` : `${company} – ${SITE_CONFIG.company.tagline}`);
  }
}

import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';
import { WordmarkComponent } from '../wordmark/wordmark.component';
import { NAV_LINKS } from './nav-links';

@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, IconComponent, WordmarkComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);

  protected readonly config = SITE_CONFIG;
  protected readonly links = NAV_LINKS;
  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.menuOpen.set(false));

    effect(() => {
      this.document.body.classList.toggle('no-scroll', this.menuOpen());
    });
  }

  @HostListener('window:scroll')
  protected onScroll(): void {
    this.scrolled.set((this.document.defaultView?.scrollY ?? 0) > 8);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.menuOpen.set(false);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}

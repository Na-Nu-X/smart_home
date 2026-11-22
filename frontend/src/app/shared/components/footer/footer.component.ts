import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';
import { NAV_LINKS } from '../navbar/nav-links';
import { WordmarkComponent } from '../wordmark/wordmark.component';

@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, WordmarkComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly config = SITE_CONFIG;
  protected readonly links = NAV_LINKS;
  protected readonly year = new Date().getFullYear();
}

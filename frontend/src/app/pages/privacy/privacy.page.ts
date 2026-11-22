import { ChangeDetectionStrategy, Component } from '@angular/core';

import { SITE_CONFIG } from '../../core/config/site.config';

@Component({
  selector: 'app-privacy-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="page-hero">
      <div class="container--narrow">
        <p class="eyebrow">GDPR</p>
        <h1 class="h2">Ochrana osobných údajov</h1>
        <p class="lead">{{ config.legal.gdprNotice }}</p>
      </div>
    </header>
    <section class="section section--tight">
      <div class="container--narrow prose">
        <h2 class="h3">Prevádzkovateľ</h2>
        <p>
          {{ config.company.legalName }}, {{ config.showroom.street }}, {{ config.showroom.postalCode }}
          {{ config.showroom.city }}, IČO: {{ config.company.ico }}, DIČ: {{ config.company.dic }}.
          {{ config.company.registry }}.
        </p>
        <h2 class="h3">Účel a právny základ spracúvania</h2>
        <p>
          Údaje z formulárov (meno, e-mail, telefón, lokalita stavby, parametre projektu a priložený pôdorys)
          spracúvame na účel vybavenia vášho dopytu a prípravy cenovej ponuky podľa čl. 6 ods. 1 písm. b) GDPR –
          opatrenia pred uzatvorením zmluvy na žiadosť dotknutej osoby.
        </p>
        <h2 class="h3">Doba uchovávania</h2>
        <p>
          Údaje uchovávame po dobu nevyhnutnú na vybavenie dopytu, najdlhšie 24 mesiacov od posledného kontaktu,
          pokiaľ nedôjde k uzatvoreniu zmluvy.
        </p>
        <h2 class="h3">Vaše práva</h2>
        <p>
          Máte právo na prístup k údajom, ich opravu, vymazanie, obmedzenie spracúvania, prenosnosť a právo podať
          sťažnosť na Úrad na ochranu osobných údajov SR. Žiadosti posielajte na
          <a class="text-link" [href]="'mailto:' + config.contact.consultationEmail">{{ config.contact.consultationEmail }}</a>.
        </p>
      </div>
    </section>
  `,
  styles: `
    .prose {
      display: grid;
      gap: 1rem;
    }
    .prose h2 {
      margin-top: 1.5rem;
    }
    .prose p {
      color: var(--color-ink-2);
      line-height: 1.8;
    }
  `,
})
export class PrivacyPage {
  protected readonly config = SITE_CONFIG;
}

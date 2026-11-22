import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { FAQ_ITEMS, PROCESS_STEPS } from '../../core/data/content';
import { FaqAccordionComponent } from '../../shared/components/faq-accordion/faq-accordion.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface Experience {
  icon: string;
  title: string;
  text: string;
}

@Component({
  selector: 'app-showroom-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, IconComponent, FaqAccordionComponent],
  templateUrl: './showroom.page.html',
  styleUrl: './showroom.page.scss',
})
export class ShowroomPage {
  protected readonly config = SITE_CONFIG;
  protected readonly steps = PROCESS_STEPS;
  protected readonly faq = FAQ_ITEMS;

  protected readonly heroImage =
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80';
  protected readonly detailImage =
    'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80';

  protected readonly experiences: Experience[] = [
    {
      icon: 'lighting',
      title: 'Svetelné scény a cirkadiánne svetlo',
      text: 'Prepnite obývačku z rannej scény do večernej a sledujte, ako sa mení farba svetla od 2700K po 6500K.',
    },
    {
      icon: 'shading',
      title: 'Automatické tienenie',
      text: 'Vyskúšajte natáčanie lamiel podľa slnka, ochranu pri vetre aj scénu „Kino“.',
    },
    {
      icon: 'audio',
      title: 'Multi-room audio',
      text: 'Počujte neviditeľné reproduktory pod omietkou a prechod hudby medzi zónami.',
    },
    {
      icon: 'switch',
      title: 'Dizajnové tlačidlá a ovládače',
      text: 'Chyťte do ruky rámčeky Loxone, Gira, Jung či Basalte v rôznych materiáloch.',
    },
    {
      icon: 'energy',
      title: 'Energetický manažment',
      text: 'Pozrite si živý dashboard výroby FVE, nabíjania auta a spotreby domu.',
    },
    {
      icon: 'board',
      title: 'Smart rozvádzač naživo',
      text: 'Ukážeme vám, ako vyzerá prehľadný a zdokumentovaný rozvádzač z našej dielne.',
    },
  ];
}

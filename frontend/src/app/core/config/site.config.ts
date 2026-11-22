/**
 * WHITE-LABEL CONFIGURATION
 * -----------------------------------------------------------------------------
 * Every piece of company branding and business information shown on the
 * website lives here. To rebrand the site for a new integrator, edit this file
 * (and optionally the colour tokens in `src/styles/_variables.scss`).
 */

export interface PartnerBadge {
  /** Short label shown on badges, e.g. "Loxone Platinum Partner". */
  label: string;
  /** Supporting line, e.g. "Najvyšší stupeň certifikácie". */
  note: string;
}

export interface TrustMetric {
  value: string;
  label: string;
}

export interface SocialLink {
  network: 'instagram' | 'youtube' | 'linkedin' | 'facebook';
  label: string;
  url: string;
}

export interface OpeningHours {
  days: string;
  hours: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  project: string;
  location: string;
}

export interface SiteConfig {
  company: {
    name: string;
    legalName: string;
    /** Wordmark is rendered as `primary` + `secondary` (secondary in italic serif). */
    wordmark: { primary: string; secondary: string };
    tagline: string;
    description: string;
    foundedYear: number;
    ico: string;
    dic: string;
    icDph: string;
    registry: string;
  };
  contact: {
    phone: string;
    phoneHref: string;
    consultationEmail: string;
    partnersEmail: string;
    responseTime: string;
  };
  showroom: {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    mapUrl: string;
    openingHours: OpeningHours[];
    demoHouseNote: string;
    parkingNote: string;
  };
  partnerBadges: PartnerBadge[];
  trustMetrics: TrustMetric[];
  socialLinks: SocialLink[];
  testimonials: Testimonial[];
  legal: {
    gdprNotice: string;
    privacyPolicyUrl: string;
  };
}

export const SITE_CONFIG: SiteConfig = {
  company: {
    name: 'Lumen Habitat',
    legalName: 'Lumen Habitat s.r.o.',
    wordmark: { primary: 'Lumen', secondary: 'Habitat' },
    tagline: 'Inteligentné domy, ktoré myslia za vás',
    description:
      'Certifikovaný integrátor inteligentných elektroinštalácií Loxone a KNX. Navrhujeme, realizujeme a dlhodobo ' +
      'servisujeme osvetlenie DALI, automatické tienenie, zónové vykurovanie, energetický manažment fotovoltiky a ' +
      'zabezpečenie pre rodinné domy, byty a komerčné objekty.',
    foundedYear: 2012,
    ico: '52 418 337',
    dic: '2121034588',
    icDph: 'SK2121034588',
    registry: 'Zapísaná v OR Mestského súdu Bratislava III, oddiel Sro, vložka č. 138422/B',
  },
  contact: {
    phone: '+421 905 123 456',
    phoneHref: 'tel:+421905123456',
    consultationEmail: 'projekty@lumenhabitat.sk',
    partnersEmail: 'partneri@lumenhabitat.sk',
    responseTime: 'Odpovedáme do 24 hodín v pracovných dňoch',
  },
  showroom: {
    name: 'Showroom & Experience Studio',
    street: 'Mlynské nivy 48',
    city: 'Bratislava',
    postalCode: '821 09',
    country: 'Slovensko',
    mapUrl: 'https://maps.google.com/?q=Mlynské+nivy+48,+Bratislava',
    openingHours: [
      { days: 'Pondelok – Štvrtok', hours: '9:00 – 18:00' },
      { days: 'Piatok', hours: '9:00 – 16:00' },
      { days: 'Sobota', hours: 'po dohode' },
    ],
    demoHouseNote:
      'Privátna prehliadka obývaného ukážkového domu v Ivanke pri Dunaji je možná výhradne po vopred ' +
      'dohodnutom termíne – v pokojnom tempe, s naším systémovým architektom.',
    parkingNote: 'Parkovanie pre klientov priamo pred showroomom.',
  },
  partnerBadges: [
    { label: 'Loxone Platinum Partner', note: 'Najvyšší stupeň certifikácie Loxone' },
    { label: 'KNX Certified Partner', note: 'Certifikovaní KNX integrátori' },
    { label: 'DALI Alliance', note: 'Návrh svetelných systémov DALI-2' },
  ],
  trustMetrics: [
    { value: '420+', label: 'dokončených smart domov' },
    { value: '14', label: 'rokov skúseností' },
    { value: '35 %', label: 'priemerná úspora energií' },
    { value: '24/7', label: 'vzdialená diagnostika' },
  ],
  socialLinks: [
    { network: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/' },
    { network: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/' },
    { network: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/' },
    { network: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/' },
  ],
  testimonials: [
    {
      quote:
        'Najviac oceňujeme, že dom funguje sám. Ráno sa vytiahnu žalúzie, v lete nám už nikdy nebolo v obývačke ' +
        'horúco a účty za energie klesli o tretinu. A keď sme raz niečo potrebovali upraviť, technik to vyriešil na ' +
        'diaľku do hodiny.',
      author: 'Martina a Tomáš K.',
      project: 'Rodinný dom, 285 m²',
      location: 'Bratislava – Koliba',
    },
    {
      quote:
        'Ako architektka som vďačná za partnera, ktorý rozumie svetlu. Žiadne rady vypínačov na stenách, presné ' +
        'svetelné scény a výkresy, ktoré som mohla rovno vložiť do projektu.',
      author: 'Ing. arch. Zuzana P.',
      project: 'Penthouse, 168 m²',
      location: 'Bratislava – Eurovea',
    },
    {
      quote:
        'Fotovoltiku sme mali už predtým, ale až s energetickým manažmentom dáva zmysel. Autá sa nabíjajú zo ' +
        'slnka a hlavný istič sme nemuseli navyšovať. Návratnosť vidíme v aplikácii každý deň.',
      author: 'Peter H.',
      project: 'Rodinný dom s FVE, 210 m²',
      location: 'Trnava',
    },
  ],
  legal: {
    gdprNotice:
      'Osobné údaje spracúvame výhradne na účel vybavenia vášho dopytu v súlade s nariadením GDPR a zákonom ' +
      'č. 18/2018 Z. z. Údaje neposkytujeme tretím stranám na marketingové účely.',
    privacyPolicyUrl: '/ochrana-osobnych-udajov',
  },
};

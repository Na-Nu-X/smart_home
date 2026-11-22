/**
 * Static marketing copy (Slovak) that is not managed through the Django admin.
 * Company-specific details (name, contacts, testimonials) live in site.config.ts.
 */

export interface Pillar {
  icon: string;
  title: string;
  text: string;
}

export interface ProcessStep {
  number: string;
  title: string;
  duration: string;
  text: string;
  deliverables: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export const TRUST_HIGHLIGHTS: Pillar[] = [
  {
    icon: 'badge',
    title: 'Certifikovaný partner Loxone & KNX',
    text: 'Platinum partner s tímom certifikovaných systémových integrátorov.',
  },
  {
    icon: 'leaf',
    title: 'Úspora energií až 35 %',
    text: 'Merateľne nižšie náklady na vykurovanie, chladenie a osvetlenie.',
  },
  {
    icon: 'board',
    title: 'Vlastná projekcia a výroba rozvádzačov',
    text: 'Projekt, rozvádzač aj programovanie pod jednou strechou.',
  },
];

export const WHY_US_PILLARS: Pillar[] = [
  {
    icon: 'layers',
    title: 'Kompletný servis od projektu po programovanie',
    text:
      'Navrhneme projekt elektroinštalácie, vyrobíme rozvádzač, zapojíme a naprogramujeme scény na mieru. ' +
      'Jeden partner, jedna zodpovednosť – žiadne prehadzovanie medzi elektrikárom a programátorom.',
  },
  {
    icon: 'home',
    title: 'Vlastné ukážkové štúdio',
    text:
      'V showroome si naživo vyskúšate svetelné scény, tienenie, multi-room audio aj aplikáciu. Rozhodnete sa ' +
      'podľa skúsenosti, nie podľa katalógu.',
  },
  {
    icon: 'unlock',
    title: 'Otvorené štandardy bez uzamknutia',
    text:
      'Stavíme na KNX, DALI-2, Modbus a Loxone s otvorenými rozhraniami. Váš dom nie je závislý od jedného ' +
      'výrobcu ani od jedného integrátora.',
  },
  {
    icon: 'pulse',
    title: 'Vzdialená diagnostika a dlhodobý servis',
    text:
      'So zabezpečeným vzdialeným prístupom vyriešime väčšinu požiadaviek bez výjazdu. Úpravy scén a ' +
      'aktualizácie sú súčasťou servisnej zmluvy.',
  },
];

export const PROCESS_STEPS: ProcessStep[] = [
  {
    number: '01',
    title: 'Nezáväzná konzultácia v showroome',
    duration: '60 – 90 minút',
    text:
      'Prejdeme si váš životný štýl, pôdorys a očakávania. Všetko si vyskúšate naživo – svetlo, tienenie, ' +
      'audio aj aplikáciu – a odnesiete si orientačný rozpočet.',
    deliverables: ['Analýza potrieb', 'Orientačný rozpočet', 'Odporúčaná architektúra systému'],
  },
  {
    number: '02',
    title: 'Projekt elektroinštalácie a káblovania',
    duration: '2 – 4 týždne',
    text:
      'Systémový architekt pripraví projekt rozmiestnenia tlačidiel, senzorov, svietidiel a kabeláže v ' +
      'koordinácii s architektom a projektantom elektro.',
    deliverables: ['Výkresy v DWG / PDF', 'Schéma rozvádzača', 'Presná cenová ponuka'],
  },
  {
    number: '03',
    title: 'Výroba rozvádzača a montáž',
    duration: 'podľa harmonogramu stavby',
    text:
      'Smart rozvádzač vyrábame a testujeme vo vlastnej dielni. Na stavbe dohliadame na kabeláž a zapájame ' +
      'všetky technológie – presne podľa projektu.',
    deliverables: ['Rozvádzač na mieru s dokumentáciou', 'Kontrola kabeláže', 'Revízia elektroinštalácie'],
  },
  {
    number: '04',
    title: 'Programovanie scén na mieru',
    duration: '1 – 2 týždne',
    text:
      'Naprogramujeme svetelné scény, logiku tienenia, vykurovania a energetiky. Prvé týždne systém ' +
      'dolaďujeme podľa toho, ako dom reálne používate.',
    deliverables: ['Scény a automatiky na mieru', 'Nastavenie aplikácie', 'Ladenie v prvých týždňoch'],
  },
  {
    number: '05',
    title: 'Odovzdanie, zaškolenie a servis',
    duration: 'dlhodobo',
    text:
      'Celú rodinu zaškolíme, odovzdáme dokumentáciu a prístupové údaje. Vzdialená diagnostika a servisná ' +
      'zmluva zaručia, že dom bude fungovať aj o desať rokov.',
    deliverables: ['Zaškolenie celej rodiny', 'Kompletná dokumentácia', 'Servisná zmluva a vzdialená podpora'],
  },
];

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Čo ak vypadne internet alebo Wi-Fi?',
    answer:
      'Dom funguje ďalej bez obmedzení. Celá logika beží lokálne v Miniserveri alebo v KNX zariadeniach vo ' +
      'vašom rozvádzači – svetlá, žalúzie, kúrenie aj alarm nepotrebujú internet ani cloud. Internet je ' +
      'potrebný len na ovládanie na diaľku a pre vzdialenú diagnostiku.',
  },
  {
    question: 'Oplatí sa smart home aj do menšieho 3-izbového bytu?',
    answer:
      'Áno. V byte sa najviac oplatí ovládanie osvetlenia, tienenia a individuálna regulácia teploty – úspora ' +
      'na vykurovaní sa prejaví hneď v prvej sezóne. Pri rekonštrukcii bez sekania stien využívame bezdrôtový ' +
      'systém Loxone Air, ktorý sa dá kedykoľvek rozšíriť.',
  },
  {
    question: 'Koľko vopred pred stavbou nás treba osloviť?',
    answer:
      'Ideálne ešte vo fáze projektu, najneskôr 4 – 6 týždňov pred ťahaním káblov v hrubej stavbe. Vtedy ' +
      'dokážeme navrhnúť optimálnu kabeláž a umiestnenie rozvádzača. Ak ste už ďalej, nevadí – vždy existuje ' +
      'riešenie, len môže byť čiastočne bezdrôtové.',
  },
  {
    question: 'Koľko stojí inteligentná elektroinštalácia oproti klasickej?',
    answer:
      'Pri novostavbe rodinného domu sa základná smart elektroinštalácia (osvetlenie, tienenie, kúrenie) ' +
      'pohybuje približne o 25 – 40 % nad cenou klasickej kvalitnej elektroinštalácie. Rozdiel sa vracia v ' +
      'úsporách energií a vyššej hodnote nehnuteľnosti. Orientačnú sumu vám ukáže naša kalkulačka.',
  },
  {
    question: 'Môžem systém neskôr rozšíriť?',
    answer:
      'Samozrejme. Pri návrhu vždy počítame s rezervou v rozvádzači aj v kabeláži. Neskôr môžete doplniť ' +
      'fotovoltiku, wallbox, multi-room audio či ďalšie zóny bez veľkých zásahov.',
  },
  {
    question: 'Ako prebieha servis a čo ak firma prestane existovať?',
    answer:
      'Väčšinu servisných požiadaviek riešime na diaľku. Odovzdávame kompletnú dokumentáciu aj konfiguračné ' +
      'súbory a stavíme na otvorené štandardy – systém dokáže prevziať ktorýkoľvek certifikovaný Loxone alebo ' +
      'KNX integrátor.',
  },
];

export const B2B_SERVICES: Pillar[] = [
  {
    icon: 'switch',
    title: 'Čisté steny bez „wall acne“',
    text:
      'Namiesto radov vypínačov jedno dizajnové multifunkčné tlačidlo na miestnosť. Rámčeky Gira, Jung, ' +
      'Loxone Touch Pure alebo Basalte v materiáloch podľa vášho konceptu.',
  },
  {
    icon: 'lighting',
    title: 'Svetelný dizajn DALI-2',
    text:
      'Pomôžeme so svetelnotechnickým návrhom, Tunable White a scénami. Svietidlá vyberiete vy – my zabezpečíme, ' +
      'aby sa dali plynulo a presne riadiť.',
  },
  {
    icon: 'drawing',
    title: 'CAD dokumentácia a koordinácia',
    text:
      'Dodáme výkresy rozmiestnenia prvkov v DWG, popisy funkcií a schémy rozvádzača. Koordinujeme sa s ' +
      'projektantom elektro, VZT a ÚK.',
  },
  {
    icon: 'home',
    title: 'Showroom pre vašich klientov',
    text:
      'Priveďte klientov do nášho showroomu. Prezentáciu prispôsobíme vášmu projektu a rozhodovanie bude pre ' +
      'všetkých rýchlejšie.',
  },
];

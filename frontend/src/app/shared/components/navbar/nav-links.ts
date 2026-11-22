export interface NavLink {
  label: string;
  path: string;
  exact?: boolean;
}

export const NAV_LINKS: NavLink[] = [
  { label: 'Riešenia', path: '/riesenia' },
  { label: 'Realizácie', path: '/realizacie' },
  { label: 'Showroom & Proces', path: '/showroom-a-proces' },
  { label: 'Pre architektov', path: '/pre-architektov' },
  { label: 'Kalkulačka ceny', path: '/kalkulacka' },
];

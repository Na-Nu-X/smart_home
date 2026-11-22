import { IconName } from '../models/api.models';

/** Smart module keys – must match `SMART_MODULES` in backend/smarthome/constants.py. */
export type SmartModuleKey = 'osvetlenie' | 'tienenie' | 'klima' | 'energia' | 'zabezpecenie' | 'audio';

export interface SmartModule {
  key: SmartModuleKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: IconName;
}

export const SMART_MODULES: readonly SmartModule[] = [
  {
    key: 'osvetlenie',
    label: 'Inteligentné osvetlenie (DALI/RGBW)',
    shortLabel: 'Osvetlenie',
    description: 'Scény, stmievanie, cirkadiánne svetlo',
    icon: 'lighting',
  },
  {
    key: 'tienenie',
    label: 'Automatické tienenie (žalúzie/rolety)',
    shortLabel: 'Tienenie',
    description: 'Riadenie podľa slnka, vetra a teploty',
    icon: 'shading',
  },
  {
    key: 'klima',
    label: 'Zónové vykurovanie a chladenie',
    shortLabel: 'Vykurovanie',
    description: 'Teplota v každej miestnosti, rekuperácia',
    icon: 'climate',
  },
  {
    key: 'energia',
    label: 'Energetický manažment (FVE + Wallbox)',
    shortLabel: 'Energia',
    description: 'Prebytky z FVE, nabíjanie EV',
    icon: 'energy',
  },
  {
    key: 'zabezpecenie',
    label: 'Zabezpečenie, prístup a kamery',
    shortLabel: 'Zabezpečenie',
    description: 'Alarm, NFC prístup, video-vrátnik',
    icon: 'security',
  },
  {
    key: 'audio',
    label: 'Multi-room audio',
    shortLabel: 'Audio',
    description: 'Hudba v každej zóne a na terase',
    icon: 'audio',
  },
] as const;

export const SMART_MODULE_KEYS = SMART_MODULES.map((m) => m.key);

export function isSmartModuleKey(value: string): value is SmartModuleKey {
  return (SMART_MODULE_KEYS as readonly string[]).includes(value);
}

/** Maps a backend domain `icon_name` to the matching estimator / wizard module. */
export const DOMAIN_ICON_TO_MODULE: Record<string, SmartModuleKey> = {
  lighting: 'osvetlenie',
  shading: 'tienenie',
  climate: 'klima',
  energy: 'energia',
  security: 'zabezpecenie',
  audio: 'audio',
};

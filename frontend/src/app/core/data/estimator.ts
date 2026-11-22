import { SmartModuleKey } from './smart-modules';

/**
 * Orientational pricing model for the Smart Home budget estimator.
 * All coefficients are intentionally kept in one place so the integrator can
 * tune them to their own price list.
 */

export type EstimatorPropertyType = 'byt' | 'rodinny_dom' | 'komercny';
export type EstimatorStage = 'novostavba' | 'hotovy';

export interface EstimatorInput {
  propertyType: EstimatorPropertyType;
  areaSqm: number;
  stage: EstimatorStage;
  modules: readonly SmartModuleKey[];
}

export interface ArchitectureRecommendation {
  key: 'wired' | 'wired-knx' | 'wireless';
  title: string;
  description: string;
  highlights: string[];
}

export interface EstimatorResult {
  minEur: number;
  maxEur: number;
  savingsPercent: number;
  annualSavingsEur: number;
  architecture: ArchitectureRecommendation;
}

export const ESTIMATOR_AREA = { min: 60, max: 450, step: 5, default: 160 } as const;

/** Base system: Miniserver, distribution board, programming, commissioning. */
const BASE_COST: Record<EstimatorPropertyType, number> = {
  byt: 2900,
  rodinny_dom: 4600,
  komercny: 6800,
};

/** Per module: fixed hardware + cost per m² (wired installation). */
const MODULE_COST: Record<SmartModuleKey, { fixed: number; perSqm: number; savings: number }> = {
  osvetlenie: { fixed: 900, perSqm: 30, savings: 7 },
  tienenie: { fixed: 600, perSqm: 21, savings: 8 },
  klima: { fixed: 1100, perSqm: 24, savings: 12 },
  energia: { fixed: 3200, perSqm: 4, savings: 10 },
  zabezpecenie: { fixed: 2300, perSqm: 8, savings: 1 },
  audio: { fixed: 1400, perSqm: 15, savings: 0 },
};

const PROPERTY_MULTIPLIER: Record<EstimatorPropertyType, number> = {
  byt: 0.95,
  rodinny_dom: 1,
  komercny: 1.12,
};

/** Wireless retrofit saves on cabling and board size but has fewer DALI options. */
const WIRELESS_MULTIPLIER = 0.8;

/** Typical annual energy cost per m² (heating, cooling, lighting, hot water). */
const ANNUAL_ENERGY_COST_PER_SQM: Record<EstimatorPropertyType, number> = {
  byt: 11,
  rodinny_dom: 13,
  komercny: 16,
};

const MAX_SAVINGS = 35;

function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}

export function recommendArchitecture(
  propertyType: EstimatorPropertyType,
  stage: EstimatorStage,
): ArchitectureRecommendation {
  if (stage === 'hotovy') {
    return {
      key: 'wireless',
      title: 'Bezdrôtový Loxone Air',
      description:
        'Ideálne pre hotové interiéry a rekonštrukcie bez sekania stien. Bezdrôtové tlačidlá, stmievače a ' +
        'hlavice sa jednoducho doplnia k existujúcej elektroinštalácii.',
      highlights: ['Bez búrania a prachu', 'Montáž za 2 – 5 dní', 'Rozšíriteľné kedykoľvek neskôr'],
    };
  }
  if (propertyType === 'komercny') {
    return {
      key: 'wired-knx',
      title: 'Káblová zbernica KNX + DALI-2',
      description:
        'Otvorený svetový štandard pre budovy s dlhou životnosťou. Zariadenia od stoviek výrobcov, ' +
        'integrácia VZT, BACnet a centrálny energetický monitoring.',
      highlights: ['Otvorený štandard ISO/IEC 14543', 'Integrácia BMS / BACnet', 'Škálovateľné na celé budovy'],
    };
  }
  return {
    key: 'wired',
    title: 'Káblová zbernica Loxone Tree / KNX',
    description:
      'Najspoľahlivejšie riešenie pre novostavby a hrubé stavby. Centrálny rozvádzač, prepojené senzory a ' +
      'zbernicová kabeláž pripravená na desaťročia bez výpadkov.',
    highlights: ['Najvyššia spoľahlivosť', 'Kompletná DALI kontrola svetla', 'Funguje aj bez internetu'],
  };
}

export function estimateBudget(input: EstimatorInput): EstimatorResult | null {
  if (input.modules.length === 0) {
    return null;
  }
  const area = Math.min(Math.max(input.areaSqm, ESTIMATOR_AREA.min), ESTIMATOR_AREA.max);
  const stageMultiplier = input.stage === 'hotovy' ? WIRELESS_MULTIPLIER : 1;

  const modulesCost = input.modules.reduce((sum, key) => {
    const cost = MODULE_COST[key];
    return sum + cost.fixed + cost.perSqm * area;
  }, 0);

  const total = (BASE_COST[input.propertyType] + modulesCost * stageMultiplier) * PROPERTY_MULTIPLIER[input.propertyType];

  const rawSavings = 3 + input.modules.reduce((sum, key) => sum + MODULE_COST[key].savings, 0);
  const savingsPercent = Math.min(MAX_SAVINGS, Math.round(rawSavings * (input.stage === 'hotovy' ? 0.85 : 1)));
  const annualEnergyCost = area * ANNUAL_ENERGY_COST_PER_SQM[input.propertyType];

  return {
    minEur: roundTo(total * 0.9, 500),
    maxEur: roundTo(total * 1.2, 500),
    savingsPercent,
    annualSavingsEur: roundTo((annualEnergyCost * savingsPercent) / 100, 10),
    architecture: recommendArchitecture(input.propertyType, input.stage),
  };
}

/** API contracts mirroring the Django REST Framework serializers. */

export type IconName =
  | 'lighting'
  | 'shading'
  | 'climate'
  | 'energy'
  | 'security'
  | 'audio';

export interface SolutionDomain {
  id: number;
  name: string;
  slug: string;
  short_summary: string;
  icon_name: IconName | string;
  display_order: number;
  solution_count: number;
}

export interface DomainMini {
  id: number;
  name: string;
  slug: string;
  icon_name: IconName | string;
}

export interface SmartSolution {
  id: number;
  name: string;
  slug: string;
  domain: DomainMini;
  short_description: string;
  supported_protocols: string[];
  energy_saving_note: string;
  /** Decimal serialized as string by DRF, e.g. "3900.00". */
  starting_price_eur: string | null;
  cover_image_url: string;
  is_featured: boolean;
}

export interface SmartSolutionDetail extends SmartSolution {
  detailed_description: string;
  everyday_benefits: string[];
  related_solutions: SmartSolution[];
}

export type ReferencePropertyType = 'rodinny_dom' | 'byt_penthouse' | 'komercny_objekt';

export interface ReferenceInstallation {
  id: number;
  title: string;
  slug: string;
  property_type: ReferencePropertyType;
  property_type_display: string;
  location_city: string;
  floor_area_sqm: number;
  system_platform: string;
  measured_benefit: string;
  cover_image_url: string;
  completion_year: number | null;
  is_featured: boolean;
  display_order: number;
}

export interface ReferencePhoto {
  id: number;
  image_url: string;
  caption: string;
  display_order: number;
}

export interface ReferenceInstallationDetail extends ReferenceInstallation {
  client_vision: string;
  implemented_features: string[];
  photos: ReferencePhoto[];
}

// --- Lead submission ---------------------------------------------------------

export type InquiryGoal = 'cenova_ponuka' | 'navsteva_showroomu' | 'konzultacia_projektu';
export type ConsultationPropertyType = 'rodinny_dom' | 'byt' | 'komercny';
export type ConstructionStage = 'projekt' | 'hruba_stavba' | 'rekonstrukcia' | 'hotovy_dom';
export type PartnerRole = 'architekt' | 'elektro_projektant' | 'developer';

export interface ConsultationRequestPayload {
  inquiry_goal: InquiryGoal;
  property_type: ConsultationPropertyType;
  construction_stage: ConstructionStage;
  floor_area_sqm: number | null;
  selected_modules: string[];
  location_city: string;
  client_name: string;
  email: string;
  phone: string;
  notes: string;
  estimated_budget: string;
  gdpr_consent: boolean;
  floorplan_file?: File | null;
}

export interface PartnerInquiryPayload {
  partner_role: PartnerRole;
  studio_or_company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  message: string;
  gdpr_consent: boolean;
}

export interface LeadResponse {
  id: number;
  message: string;
}

/** DRF validation error body: field -> messages. */
export type ApiFieldErrors = Record<string, string[]>;

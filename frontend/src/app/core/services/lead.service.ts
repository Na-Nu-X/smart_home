import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiFieldErrors,
  ConsultationRequestPayload,
  LeadResponse,
  PartnerInquiryPayload,
} from '../models/api.models';

/** Submits homeowner consultation requests and B2B partner inquiries. */
@Injectable({ providedIn: 'root' })
export class LeadService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  submitConsultation(payload: ConsultationRequestPayload): Observable<LeadResponse> {
    const url = `${this.baseUrl}/consultations/`;
    const { floorplan_file: file, ...fields } = payload;

    if (!file) {
      return this.http.post<LeadResponse>(url, fields);
    }

    // Multipart for floor plan upload – list values are sent as repeated keys.
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (Array.isArray(value)) {
        value.forEach((item) => form.append(key, String(item)));
      } else if (value !== null && value !== undefined) {
        form.append(key, String(value));
      }
    }
    form.append('floorplan_file', file, file.name);
    return this.http.post<LeadResponse>(url, form);
  }

  submitPartnerInquiry(payload: PartnerInquiryPayload): Observable<LeadResponse> {
    return this.http.post<LeadResponse>(`${this.baseUrl}/partners/`, payload);
  }
}

/** Extracts DRF field errors (or a general message) from an HTTP error. */
export function parseApiError(error: unknown): { fields: ApiFieldErrors; general: string } {
  const fallback = 'Odoslanie sa nepodarilo. Skúste to prosím znova alebo nás kontaktujte telefonicky.';
  if (!(error instanceof HttpErrorResponse)) {
    return { fields: {}, general: fallback };
  }
  if (error.status === 0) {
    return { fields: {}, general: 'Nepodarilo sa spojiť so serverom. Skontrolujte pripojenie na internet.' };
  }
  if (error.status === 429) {
    return { fields: {}, general: 'Odoslali ste priveľa požiadaviek. Skúste to prosím o chvíľu.' };
  }
  if (error.status === 400 && error.error && typeof error.error === 'object') {
    const fields: ApiFieldErrors = {};
    for (const [key, value] of Object.entries(error.error as Record<string, unknown>)) {
      fields[key] = Array.isArray(value) ? value.map(String) : [String(value)];
    }
    const general = fields['non_field_errors']?.join(' ') ?? 'Skontrolujte prosím označené polia.';
    return { fields, general };
  }
  return { fields: {}, general: fallback };
}

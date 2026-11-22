import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ReferenceInstallation,
  ReferenceInstallationDetail,
  ReferencePropertyType,
  SmartSolution,
  SmartSolutionDetail,
  SolutionDomain,
} from '../models/api.models';

export interface SolutionQuery {
  domain?: string | null;
  featured?: boolean;
  search?: string;
  ordering?: string;
}

export interface ReferenceQuery {
  property_type?: ReferencePropertyType | null;
  featured?: boolean;
  search?: string;
}

function toParams(query: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      params = params.set(key, String(value));
    }
  }
  return params;
}

/** Read-only access to the public smart home catalogue. */
@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  /** Domains change rarely – cache for the lifetime of the app. */
  private readonly domains$ = this.http
    .get<SolutionDomain[]>(`${this.baseUrl}/domains/`)
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  getDomains(): Observable<SolutionDomain[]> {
    return this.domains$;
  }

  getSolutions(query: SolutionQuery = {}): Observable<SmartSolution[]> {
    return this.http.get<SmartSolution[]>(`${this.baseUrl}/solutions/`, { params: toParams(query) });
  }

  getSolution(slug: string): Observable<SmartSolutionDetail> {
    return this.http.get<SmartSolutionDetail>(`${this.baseUrl}/solutions/${encodeURIComponent(slug)}/`);
  }

  getReferences(query: ReferenceQuery = {}): Observable<ReferenceInstallation[]> {
    return this.http.get<ReferenceInstallation[]>(`${this.baseUrl}/references/`, { params: toParams(query) });
  }

  getReference(slug: string): Observable<ReferenceInstallationDetail> {
    return this.http.get<ReferenceInstallationDetail>(`${this.baseUrl}/references/${encodeURIComponent(slug)}/`);
  }
}

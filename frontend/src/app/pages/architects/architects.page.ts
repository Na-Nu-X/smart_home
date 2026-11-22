import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { B2B_SERVICES } from '../../core/data/content';
import { PartnerInquiryPayload, PartnerRole } from '../../core/models/api.models';
import { LeadService, parseApiError } from '../../core/services/lead.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { applyServerErrors, controlError, phoneValidator } from '../../shared/forms/form-utils';

interface RoleOption {
  value: PartnerRole;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-architects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  templateUrl: './architects.page.html',
  styleUrl: './architects.page.scss',
})
export class ArchitectsPage {
  private readonly fb = inject(FormBuilder);
  private readonly leads = inject(LeadService);

  protected readonly config = SITE_CONFIG;
  protected readonly services = B2B_SERVICES;
  protected readonly heroImage =
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80';

  protected readonly roles: RoleOption[] = [
    { value: 'architekt', label: 'Architekt / Interiérový dizajnér', icon: 'drawing' },
    { value: 'elektro_projektant', label: 'Projektant elektroinštalácií', icon: 'cable' },
    { value: 'developer', label: 'Developer rezidenčných projektov', icon: 'building' },
  ];

  protected readonly benefits = [
    'Technická podpora pri návrhu už od štúdie',
    'Výkresy a popisy funkcií v DWG / PDF',
    'Prezentácia pre vašich klientov v showroome',
    'Jeden zodpovedný systémový architekt',
    'Partnerské ceny a provízny program',
    'Garantované termíny a koordinácia so stavbou',
  ];

  protected readonly form = this.fb.nonNullable.group({
    partner_role: this.fb.nonNullable.control<PartnerRole | ''>('', Validators.required),
    studio_or_company_name: ['', [Validators.required, Validators.maxLength(200)]],
    contact_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [phoneValidator]],
    message: ['', [Validators.required, Validators.minLength(20)]],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly successMessage = signal('');
  protected readonly generalError = signal('');

  protected readonly error = (name: string): string | null => controlError(this.form.get(name));

  protected selectRole(role: PartnerRole): void {
    this.form.controls.partner_role.setValue(role);
    this.form.controls.partner_role.markAsTouched();
  }

  protected submit(): void {
    this.generalError.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.generalError.set('Skontrolujte prosím označené polia.');
      return;
    }
    this.submitting.set(true);
    const payload = this.form.getRawValue() as PartnerInquiryPayload;
    this.leads.submitPartnerInquiry(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.submitted.set(true);
        this.successMessage.set(response.message);
        this.form.reset();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        const parsed = parseApiError(error);
        applyServerErrors(this.form, parsed.fields);
        this.generalError.set(parsed.general);
      },
    });
  }

  protected resetForm(): void {
    this.submitted.set(false);
    this.successMessage.set('');
  }
}

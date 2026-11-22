import { AbstractControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';

import { ApiFieldErrors } from '../../core/models/api.models';

/** Slovak/international phone number, at least 9 digits. */
export const phoneValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) {
    return null;
  }
  const digits = value.replace(/\D/g, '');
  return /^\+?[0-9\s/()-]{9,20}$/.test(value) && digits.length >= 9 ? null : { phone: true };
};

const MESSAGES: Record<string, (error: unknown) => string> = {
  required: () => 'Toto pole je povinné.',
  requiredTrue: () => 'Pre odoslanie je potrebný váš súhlas.',
  email: () => 'Zadajte platnú e-mailovú adresu.',
  phone: () => 'Zadajte platné telefónne číslo, napr. +421 900 123 456.',
  minlength: (e) => `Zadajte aspoň ${(e as { requiredLength: number }).requiredLength} znakov.`,
  maxlength: (e) => `Maximálne ${(e as { requiredLength: number }).requiredLength} znakov.`,
  min: (e) => `Minimálna hodnota je ${(e as { min: number }).min}.`,
  max: (e) => `Maximálna hodnota je ${(e as { max: number }).max}.`,
  server: (e) => String(e),
};

/** Returns the first human-readable (Slovak) error for a touched control. */
export function controlError(control: AbstractControl | null): string | null {
  if (!control || !control.errors || !(control.touched || control.dirty)) {
    return null;
  }
  const [key, value] = Object.entries(control.errors)[0];
  return (MESSAGES[key] ?? (() => 'Neplatná hodnota.'))(value);
}

/** Applies DRF field errors to matching form controls as `server` errors. */
export function applyServerErrors(form: FormGroup, errors: ApiFieldErrors): void {
  for (const [field, messages] of Object.entries(errors)) {
    const control = form.get(field);
    if (control) {
      control.setErrors({ ...(control.errors ?? {}), server: messages.join(' ') });
      control.markAsTouched();
    }
  }
}

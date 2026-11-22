import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import { SMART_MODULES, SmartModuleKey, isSmartModuleKey } from '../../core/data/smart-modules';
import {
  ConstructionStage,
  ConsultationPropertyType,
  ConsultationRequestPayload,
  InquiryGoal,
} from '../../core/models/api.models';
import { LeadService, parseApiError } from '../../core/services/lead.service';
import { formatEur } from '../../core/utils/format';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { applyServerErrors, controlError, phoneValidator } from '../../shared/forms/form-utils';

interface Option<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon: string;
}

const GOALS: Option<InquiryGoal>[] = [
  {
    value: 'cenova_ponuka',
    label: 'Nezáväzná cenová ponuka a projekt',
    description: 'Pripravíme návrh riešenia a rozpočet',
    icon: 'file',
  },
  {
    value: 'navsteva_showroomu',
    label: 'Osobná návšteva a ukážka v showroome',
    description: 'Vyskúšate si všetko naživo',
    icon: 'home',
  },
  {
    value: 'konzultacia_projektu',
    label: 'Konzultácia k rozpracovanému projektu',
    description: 'Posúdime projekt elektroinštalácie',
    icon: 'drawing',
  },
];

const PROPERTY_TYPES: Option<ConsultationPropertyType>[] = [
  { value: 'rodinny_dom', label: 'Rodinný dom', icon: 'home' },
  { value: 'byt', label: 'Byt / Apartmán', icon: 'building' },
  { value: 'komercny', label: 'Komerčný objekt', icon: 'layers' },
];

const STAGES: Option<ConstructionStage>[] = [
  { value: 'projekt', label: 'Ešte len pripravujeme projekt', icon: 'drawing' },
  { value: 'hruba_stavba', label: 'Hrubá stavba (pred ťahaním káblov)', icon: 'cable' },
  { value: 'rekonstrukcia', label: 'Kompletná rekonštrukcia', icon: 'layers' },
  { value: 'hotovy_dom', label: 'Hotový dom / Byt (bezdrôtové riešenie)', icon: 'wifi' },
];

const ALLOWED_EXTENSIONS = ['.pdf', '.dwg', '.dxf', '.png', '.jpg', '.jpeg', '.webp'];
const MAX_FILE_BYTES = 15 * 1024 * 1024;

type StepIndex = 0 | 1 | 2;

const STEP_FIELDS: Record<StepIndex, string[]> = {
  0: ['inquiry_goal', 'property_type', 'construction_stage', 'floor_area_sqm', 'location_city'],
  1: ['selected_modules', 'notes'],
  2: ['client_name', 'email', 'phone', 'gdpr_consent'],
};

function pickOption<T extends string>(options: Option<T>[], value: string | undefined): T | '' {
  return options.find((o) => o.value === value)?.value ?? '';
}

@Component({
  selector: 'app-consultation-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ReactiveFormsModule, IconComponent],
  templateUrl: './consultation.page.html',
  styleUrl: './consultation.page.scss',
})
export class ConsultationPage {
  private readonly fb = inject(FormBuilder);
  private readonly leads = inject(LeadService);
  private readonly document = inject(DOCUMENT);

  // --- Query params (pre-fill) ---------------------------------------------
  readonly goal = input<string>();
  readonly type = input<string>();
  readonly area = input<string>();
  readonly stage = input<string>();
  readonly modules = input<string>();
  readonly budget = input<string>();
  readonly solution = input<string>();
  readonly reference = input<string>();

  protected readonly config = SITE_CONFIG;
  protected readonly goals = GOALS;
  protected readonly propertyTypes = PROPERTY_TYPES;
  protected readonly stages = STAGES;
  protected readonly smartModules = SMART_MODULES;
  protected readonly stepLabels = ['Projekt', 'Moduly a podklady', 'Kontakt'];

  protected readonly form = this.fb.nonNullable.group({
    inquiry_goal: this.fb.nonNullable.control<InquiryGoal | ''>('cenova_ponuka', Validators.required),
    property_type: this.fb.nonNullable.control<ConsultationPropertyType | ''>('', Validators.required),
    construction_stage: this.fb.nonNullable.control<ConstructionStage | ''>('', Validators.required),
    floor_area_sqm: this.fb.control<number | null>(null, [Validators.min(10), Validators.max(20000)]),
    location_city: ['', [Validators.required, Validators.minLength(2)]],
    selected_modules: this.fb.nonNullable.control<SmartModuleKey[]>([]),
    notes: ['', [Validators.maxLength(3000)]],
    client_name: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, phoneValidator]],
    gdpr_consent: [false, Validators.requiredTrue],
  });

  protected readonly currentStep = signal<StepIndex>(0);
  protected readonly file = signal<File | null>(null);
  protected readonly fileError = signal('');
  protected readonly dragOver = signal(false);
  protected readonly submitting = signal(false);
  protected readonly submittedMessage = signal('');
  protected readonly generalError = signal('');

  /** Reactive snapshot of the form value for summaries / option highlighting. */
  protected readonly value = toSignal(this.form.valueChanges.pipe(startWith(this.form.getRawValue())), {
    initialValue: this.form.getRawValue(),
  });

  protected readonly selectedModuleSet = computed(() => new Set(this.value().selected_modules ?? []));

  protected readonly estimatedBudget = computed(() => {
    const match = /^(\d+)-(\d+)$/.exec(this.budget() ?? '');
    return match ? `${formatEur(Number(match[1]))} – ${formatEur(Number(match[2]))}` : '';
  });

  protected readonly summary = computed(() => {
    const v = this.value();
    return {
      goal: GOALS.find((g) => g.value === v.inquiry_goal)?.label ?? '—',
      type: PROPERTY_TYPES.find((p) => p.value === v.property_type)?.label ?? '—',
      stage: STAGES.find((s) => s.value === v.construction_stage)?.label ?? '—',
      area: v.floor_area_sqm ? `${v.floor_area_sqm} m²` : '—',
      city: v.location_city || '—',
      modules:
        SMART_MODULES.filter((m) => (v.selected_modules ?? []).includes(m.key))
          .map((m) => m.shortLabel)
          .join(', ') || '—',
    };
  });

  protected readonly error = (name: string): string | null => controlError(this.form.get(name));

  constructor() {
    // Pre-fill from query params (also when navigating between pre-filled links).
    effect(() => {
      const goal = this.goal();
      const type = this.type();
      const area = Number.parseInt(this.area() ?? '', 10);
      const stage = this.stage();
      const modules = (this.modules() ?? '').split(',').filter(isSmartModuleKey);
      const solution = this.solution();
      const reference = this.reference();

      untracked(() => {
        const notes: string[] = [];
        if (solution) {
          notes.push(`Mám záujem o riešenie: ${solution}.`);
        }
        if (reference) {
          notes.push(`Zaujala ma realizácia: ${reference}.`);
        }
        this.form.patchValue({
          ...(pickOption(GOALS, goal) ? { inquiry_goal: pickOption(GOALS, goal) } : {}),
          ...(pickOption(PROPERTY_TYPES, type) ? { property_type: pickOption(PROPERTY_TYPES, type) } : {}),
          ...(pickOption(STAGES, stage) ? { construction_stage: pickOption(STAGES, stage) } : {}),
          ...(Number.isFinite(area) && area > 0 ? { floor_area_sqm: area } : {}),
          ...(modules.length ? { selected_modules: modules } : {}),
          ...(notes.length ? { notes: notes.join('\n') } : {}),
        });
      });
    });
  }

  // --- Option helpers ---------------------------------------------------------

  protected setOption(
    control: 'inquiry_goal' | 'property_type' | 'construction_stage',
    value: string,
  ): void {
    this.form.patchValue({ [control]: value } as Partial<ReturnType<typeof this.form.getRawValue>>);
    this.form.get(control)?.markAsTouched();
  }

  protected toggleModule(key: SmartModuleKey): void {
    const current = this.form.controls.selected_modules.value;
    const next = current.includes(key) ? current.filter((k) => k !== key) : [...current, key];
    this.form.controls.selected_modules.setValue(next);
  }

  // --- File upload ------------------------------------------------------------

  protected onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.setFile(input.files?.[0] ?? null);
    input.value = '';
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(false);
    this.setFile(event.dataTransfer?.files?.[0] ?? null);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragOver.set(true);
  }

  protected removeFile(): void {
    this.file.set(null);
    this.fileError.set('');
  }

  protected fileSize(bytes: number): string {
    return bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.ceil(bytes / 1024)} kB`;
  }

  private setFile(file: File | null): void {
    this.fileError.set('');
    if (!file) {
      return;
    }
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      this.fileError.set('Povolené formáty: PDF, DWG, DXF, PNG, JPG alebo WEBP.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      this.fileError.set('Súbor je príliš veľký. Maximálna veľkosť je 15 MB.');
      return;
    }
    this.file.set(file);
  }

  // --- Navigation -------------------------------------------------------------

  private validateStep(step: StepIndex): boolean {
    const controls = STEP_FIELDS[step].map((name) => this.form.get(name)).filter((c) => c !== null);
    controls.forEach((control) => control.markAsTouched());
    return controls.every((control) => control.valid);
  }

  protected next(): void {
    this.generalError.set('');
    const step = this.currentStep();
    if (!this.validateStep(step)) {
      this.generalError.set('Doplňte prosím povinné údaje.');
      return;
    }
    if (step < 2) {
      this.currentStep.set((step + 1) as StepIndex);
      this.scrollToForm();
    }
  }

  protected back(): void {
    this.generalError.set('');
    const step = this.currentStep();
    if (step > 0) {
      this.currentStep.set((step - 1) as StepIndex);
      this.scrollToForm();
    }
  }

  protected goTo(step: StepIndex): void {
    // Allow jumping back freely, forward only through validation.
    if (step < this.currentStep()) {
      this.currentStep.set(step);
    } else {
      for (let s = this.currentStep(); s < step; s++) {
        if (!this.validateStep(s as StepIndex)) {
          this.currentStep.set(s as StepIndex);
          return;
        }
      }
      this.currentStep.set(step);
    }
  }

  private scrollToForm(): void {
    this.document.getElementById('wizard')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  protected submit(): void {
    this.generalError.set('');
    if (!this.validateStep(2)) {
      this.generalError.set('Doplňte prosím kontaktné údaje.');
      return;
    }
    if (this.form.invalid) {
      // Some earlier step became invalid (e.g. server error) – go back to it.
      const invalidStep = ([0, 1, 2] as StepIndex[]).find((s) => !this.validateStep(s)) ?? 0;
      this.currentStep.set(invalidStep);
      this.generalError.set('Skontrolujte prosím označené polia.');
      return;
    }

    const raw = this.form.getRawValue();
    const payload: ConsultationRequestPayload = {
      inquiry_goal: raw.inquiry_goal as InquiryGoal,
      property_type: raw.property_type as ConsultationPropertyType,
      construction_stage: raw.construction_stage as ConstructionStage,
      floor_area_sqm: raw.floor_area_sqm,
      selected_modules: raw.selected_modules,
      location_city: raw.location_city,
      client_name: raw.client_name,
      email: raw.email,
      phone: raw.phone,
      notes: raw.notes,
      estimated_budget: this.estimatedBudget(),
      gdpr_consent: raw.gdpr_consent,
      floorplan_file: this.file(),
    };

    this.submitting.set(true);
    this.leads.submitConsultation(payload).subscribe({
      next: (response) => {
        this.submitting.set(false);
        this.submittedMessage.set(response.message);
        this.scrollToForm();
      },
      error: (error: unknown) => {
        this.submitting.set(false);
        const parsed = parseApiError(error);
        applyServerErrors(this.form, parsed.fields);
        if (parsed.fields['floorplan_file']) {
          this.fileError.set(parsed.fields['floorplan_file'].join(' '));
        }
        const firstInvalid = ([0, 1, 2] as StepIndex[]).find((s) =>
          STEP_FIELDS[s].some((name) => parsed.fields[name]),
        );
        if (firstInvalid !== undefined) {
          this.currentStep.set(firstInvalid);
        }
        this.generalError.set(parsed.general);
      },
    });
  }

  protected startOver(): void {
    this.form.reset();
    this.file.set(null);
    this.currentStep.set(0);
    this.submittedMessage.set('');
  }
}

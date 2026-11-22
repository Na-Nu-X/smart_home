import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { Router } from '@angular/router';

import {
  ESTIMATOR_AREA,
  EstimatorPropertyType,
  EstimatorStage,
  estimateBudget,
} from '../../../core/data/estimator';
import { SMART_MODULES, SmartModuleKey } from '../../../core/data/smart-modules';
import { EurPipe, NumPipe } from '../../pipes/format.pipes';
import { IconComponent } from '../icon/icon.component';

interface Choice<T> {
  value: T;
  label: string;
  description: string;
  icon: string;
}

/**
 * Interactive Smart Home budget estimator (Angular Signals).
 * Produces an orientational turnkey investment range, annual energy savings and
 * a recommended system architecture, then pre-fills the consultation wizard.
 */
@Component({
  selector: 'app-budget-estimator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IconComponent, EurPipe, NumPipe],
  templateUrl: './budget-estimator.component.html',
  styleUrl: './budget-estimator.component.scss',
})
export class SmartHomeBudgetEstimatorComponent {
  private readonly router = inject(Router);

  /** Optional initial module pre-selection. */
  readonly initialModules = input<SmartModuleKey[]>(['osvetlenie', 'tienenie', 'klima']);

  protected readonly area = ESTIMATOR_AREA;
  protected readonly modules = SMART_MODULES;

  protected readonly propertyTypes: Choice<EstimatorPropertyType>[] = [
    { value: 'byt', label: 'Byt / Apartmán', description: 'Mestské bývanie, penthouse', icon: 'building' },
    { value: 'rodinny_dom', label: 'Rodinný dom', description: 'Novostavba, vila, bungalov', icon: 'home' },
    { value: 'komercny', label: 'Komerčný priestor', description: 'Kancelárie, showroom, hotel', icon: 'layers' },
  ];

  protected readonly stages: Choice<EstimatorStage>[] = [
    {
      value: 'novostavba',
      label: 'Novostavba / Hrubá stavba',
      description: 'Káblový systém – najvyššia spoľahlivosť',
      icon: 'cable',
    },
    {
      value: 'hotovy',
      label: 'Hotový interiér',
      description: 'Bezdrôtové riešenie bez sekania stien',
      icon: 'wifi',
    },
  ];

  protected readonly propertyType = signal<EstimatorPropertyType>('rodinny_dom');
  protected readonly areaSqm = signal<number>(ESTIMATOR_AREA.default);
  protected readonly stage = signal<EstimatorStage>('novostavba');
  /** Resets to `initialModules` whenever that input changes; user toggles update it locally. */
  protected readonly selectedModules = linkedSignal<ReadonlySet<SmartModuleKey>>(() => new Set(this.initialModules()));

  protected readonly selectedCount = computed(() => this.selectedModules().size);

  protected readonly result = computed(() =>
    estimateBudget({
      propertyType: this.propertyType(),
      areaSqm: this.areaSqm(),
      stage: this.stage(),
      // Keep canonical module order for stable results / query params.
      modules: this.modules.map((m) => m.key).filter((key) => this.selectedModules().has(key)),
    }),
  );

  /** Percentage used to paint the slider track fill. */
  protected readonly areaFill = computed(
    () => ((this.areaSqm() - ESTIMATOR_AREA.min) / (ESTIMATOR_AREA.max - ESTIMATOR_AREA.min)) * 100,
  );

  protected onAreaInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(value)) {
      this.areaSqm.set(value);
    }
  }

  protected toggleModule(key: SmartModuleKey): void {
    this.selectedModules.update((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  protected isSelected(key: SmartModuleKey): boolean {
    return this.selectedModules().has(key);
  }

  protected requestProject(): void {
    const result = this.result();
    const typeMap: Record<EstimatorPropertyType, string> = {
      byt: 'byt',
      rodinny_dom: 'rodinny_dom',
      komercny: 'komercny',
    };
    void this.router.navigate(['/konzultacia'], {
      queryParams: {
        goal: 'cenova_ponuka',
        type: typeMap[this.propertyType()],
        area: this.areaSqm(),
        stage: this.stage() === 'hotovy' ? 'hotovy_dom' : 'hruba_stavba',
        modules: this.modules
          .map((m) => m.key)
          .filter((key) => this.selectedModules().has(key))
          .join(','),
        budget: result ? `${result.minEur}-${result.maxEur}` : null,
      },
    });
  }
}

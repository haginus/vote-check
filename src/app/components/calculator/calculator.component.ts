import { NgClass } from '@angular/common';
import { Component, Inject, computed, effect, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PVForm } from '../../services/forms.service';
import { FieldMeaning, FormStructure } from '../../../elections/types';

@Component({
  selector: 'app-calculator',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
  ],
  templateUrl: './calculator.component.html',
  styleUrl: './calculator.component.scss',
})
export class CalculatorComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) private readonly data?: CalculatorData
  ) {
    effect(() => {
      const currentGroup = this.currentFormGroup();
      const firstKey = Object.keys(currentGroup.controls).find((key) => !currentGroup.get(key).disabled);
      this.calculate(firstKey);
    });
  }

  protected readonly _specs = signal<Spec[]>([
    {
      title: 'Voturi',
      description: 'Numărul de voturi valabil exprimate însumate cu cele nule ar trebui să fie egal cu numărul de alegători.',
      fields: [
        {
          id: 'voters',
          title: 'Alegători prezenți la urne',
          side: 'left',
          meaning: FieldMeaning.ParticipatingVoters,
          disabledByDefault: true,
        },
        {
          id: 'validVotes',
          title: 'Voturi valabil exprimate',
          side: 'right',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: 'invalidVotes',
          title: 'Voturi nule',
          side: 'right',
          meaning: FieldMeaning.InvalidVotes,
        },
      ],
    },
    {
      title: 'Buletine de vot',
      description: 'Numărul de buletine de vot primite ar trebui să fie egal cu cele intrate în urnă însumate cu cele anulate.',
      fields: [
        {
          id: 'receivedBallots',
          title: 'Buletine de vot primite',
          side: 'left',
          meaning: FieldMeaning.ReceivedBallots,
          disabledByDefault: true,
        },
        {
          id: 'validVotes',
          title: 'Voturi valabil exprimate',
          side: 'right',
          meaning: FieldMeaning.ValidVotes,
        },
        {
          id: 'invalidVotes',
          title: 'Voturi nule',
          side: 'right',
          meaning: FieldMeaning.InvalidVotes,
          disabledByDefault: true,
        },
        {
          id: 'spoiledBallots',
          title: 'Buletine de vot anulate',
          side: 'right',
          meaning: FieldMeaning.SpoiledBallots,
        },
      ],
    },
  ]);
  private formGroups = computed(() => {
    return this._specs().map((spec) => {
      const group = new FormGroup(
        spec.fields.reduce((acc, field) => {
          const value = this.getFieldInitialValue(field);
          acc[field.id] = new FormControl({ value, disabled: field.disabledByDefault && value !== 0 });
          return acc;
        }, {} as Record<string, FormControl<number>>),
        { validators: sideEqualityValidator(spec) }
      );
      return group;
    });
  });

  private getFieldInitialValue(field: Field) {
    if(!this.data) {
      return 0;
    }
    const meanings = Array.isArray(field.meaning) ? field.meaning : [field.meaning];
    const formFields = this.data.formStructure.sections
      .flatMap((section) => section.fields)
      .filter((field) => meanings.includes(field.meaning));
    return formFields.reduce((acc, field) => {
      return acc + (this.data.formValues[field.id] || 0);
    }, 0);
  }

  protected specIndex = signal(0);
  protected currentSpec = computed(() => this._specs()[this.specIndex()]);
  protected currentFormGroup = computed(() => this.formGroups()[this.specIndex()]);
  protected leftFields = computed(() => this.currentSpec().fields.filter((field) => field.side === 'left'));
  protected rightFields = computed(() => this.currentSpec().fields.filter((field) => field.side === 'right'));

  ngOnInit() {
    this.formGroups().forEach((group) => {
      Object.entries(group.controls).forEach(([controlId, control]) => {
        control.valueChanges.subscribe(() => {
          this.calculate(controlId);
        });
      });
    });
  }

  calculate(controlId: string) {
    const group = this.currentFormGroup();
    const currentSpec = this.currentSpec();
    const specField = currentSpec.fields.find((field) => field.id === controlId);
    const otherFields = currentSpec.fields.filter((field) => field.id !== controlId);
    const thisSideSum = currentSpec.fields
      .filter((field) => field.side == specField.side)
      .reduce((acc, field) => {
        return acc + group.get(field.id).value;
      }, 0);
    const otherSideSum = otherFields
      .filter((field) => field.side != specField.side)
      .reduce((acc, field) => {
        return acc + group.get(field.id).value;
      }, 0);
    let diff = thisSideSum - otherSideSum;
    let fieldIndex = 0;
    while(diff != 0 && fieldIndex < otherFields.length) {
      const field = otherFields[fieldIndex];
      const sideDiff = field.side == specField.side ? -diff : diff;
      const control = group.get(field.id);
      if(control.disabled) {
        fieldIndex++;
        continue;
      } else {
        const newValue = control.value + sideDiff;
        if(newValue >= 0) {
          control.setValue(newValue, { emitEvent: false });
          diff = 0;
        } else {
          control.setValue(0, { emitEvent: false });
          diff = -newValue;
        }
        fieldIndex++;
      }
    }
  }

  onFieldBlur(fieldId: string, event: FocusEvent) {
    const relatedTarget = event.relatedTarget as HTMLElement;
    if(relatedTarget?.dataset['locked'] === 'false') {
      return;
    }
    const control = this.currentFormGroup().get(fieldId);
    const fieldsNumber = this.currentSpec().fields.length;
    const disabledFieldsNumber = Object.values(
      this.currentFormGroup().controls
    ).filter((control) => control.disabled).length;
    if (parseInt(control.value) && fieldsNumber - disabledFieldsNumber > 2) {
      control.disable({ emitEvent: false });
    }
  }

  toggleLock(fieldId: string) {
    const control = this.currentFormGroup().get(fieldId);
    control.disabled
      ? control.enable({ emitEvent: false })
      : control.disable({ emitEvent: false });
  }
}

interface Spec {
  title: string;
  description: string;
  fields: Field[];
}

interface Field {
  id: string;
  title: string;
  side: 'left' | 'right';
  meaning: FieldMeaning | FieldMeaning[];
  disabledByDefault?: boolean;
}

export interface CalculatorData {
  formValues: PVForm['values'];
  formStructure: FormStructure;
}

const sideEqualityValidator = (spec: Spec) => (control: AbstractControl): ValidationErrors | null => {
  const leftSideSum = spec.fields.filter((field) => field.side === 'left').reduce((acc, field) => {
    return acc + control.get(field.id).value;
  }, 0);
  const rightSideSum = spec.fields.filter((field) => field.side === 'right').reduce((acc, field) => {
    return acc + control.get(field.id).value;
  }, 0);
  return leftSideSum === rightSideSum ? null : { sideInequality: true };
};

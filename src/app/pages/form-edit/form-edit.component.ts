import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormControlName,
  FormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsService, PVForm } from '../../services/forms.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormSimpvDialogComponent } from '../../components/form-simpv-dialog/form-simpv-dialog.component';
import { FormDeleteDialogComponent } from '../../components/form-delete-dialog/form-delete-dialog.component';
import { FormExitDialogComponent } from '../../components/form-exit-dialog/form-exit-dialog.component';
import { Candidate, Precint } from '../../../elections/types';
import { v4 as uuidv4 } from 'uuid';
import { FormData } from '../../resolvers/form.resolver';
import { Subscription, firstValueFrom } from 'rxjs';
import { CanDeactivate } from '../../guards/can-deactivate.guard';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { KeyValuePipe } from '@angular/common';
import { ValidationError } from '../../../elections/form-structures';

@Component({
  selector: 'app-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
    ReactiveFormsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    KeyValuePipe,
  ],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline', subscriptSizing: 'dynamic' }
    },
  ]
})
export class FormEditComponent implements OnInit, OnDestroy, CanDeactivate {

  matcher = new MyErrorStateMatcher();
  routeFormData = this.route.snapshot.data['formData'] as FormData;
  existingForm?: PVForm = this.routeFormData.form;
  election = this.routeFormData.election
  poll = this.routeFormData.poll;
  precinct: Precint = this.routeFormData.precinct;
  candidates: Candidate[] = this.routeFormData.candidates;
  formGroup: FormGroup;
  calculateSubscription!: Subscription;
  showErrors = false;

  constructor(
    private readonly formsService: FormsService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  async ngOnInit() {
    const formStructure = this.election.type.formStructure;
    const fields = formStructure.sections.flatMap(section => section.fields);
    const candidateFields = this.candidates.map((candidate, index) => ({
      id: formStructure.candidateSectionKey + (index + 1),
      type: 'input',
      title: candidate.candidate,
    }));
    this.formGroup = new FormGroup(
      [...fields, ...candidateFields].reduce((acc, field) => ({
        ...acc,
        [field.id]: new FormControl<number>(this.existingForm?.values[field.id]!, [positive])
      }), {}),
      { validators: formStructure.validator }
    );
    this.computeFields();
    this.calculateSubscription = this.formGroup.valueChanges.subscribe(() => {
      this.computeFields();
    });
  }

  ngOnDestroy() {
    this.calculateSubscription?.unsubscribe();
  }

  @HostListener('window:wheel', ['$event'])
  onScroll(event: Event) {
    if(document.activeElement.tagName === 'INPUT') {
      (document.activeElement as HTMLInputElement).blur();
    }
  }

  async canDeactivate() {
    if (!this.formGroup || this.formGroup.pristine) {
      return true;
    }
    const dialogRef = this.dialog.open(FormExitDialogComponent);
    const wantsToSave = await firstValueFrom(dialogRef.afterClosed());
    if(wantsToSave === undefined) {
      return false;
    } else {
      if(wantsToSave) {
        this.saveForm();
      }
      return true;
    }
  }

  computeFields() {
    const fields = this.election.type.formStructure.sections.flatMap(section => section.fields);
    fields.forEach(field => {
      if(field.type !== 'computed') return;
      const value = field.computeFn(this.formGroup);
      this.formGroup.get(field.id)?.setValue(value, { emitEvent: false });
    });
  }

  saveForm() {
    const form = this.getPvForm();

    const action = this.existingForm
      ? this.formsService.editForm(form.id, form)
      : this.formsService.createForm(form);

    action.subscribe(() => {
      this.snackBar.open('Proces verbal salvat.');
      this.existingForm = form;
      this.formGroup.markAsPristine();
    });
  }

  async deleteForm() {
    if(!await firstValueFrom(this.dialog.open(FormDeleteDialogComponent).afterClosed())) return;
    await firstValueFrom(this.formsService.deleteForm(this.existingForm!.id));
    this.formGroup.markAsPristine();
    this.router.navigate(['/']);
    this.snackBar.open('Proces verbal șters.');
  }

  async autocompleteFromSimpv() {
    const simpvPullStrategy = this.election.type.formStructure.simpvPullStrategy;
    if(!simpvPullStrategy) return;
    const dialogRef = this.dialog.open(FormSimpvDialogComponent, {
      data: {
        form: this.getPvForm(),
      },
    });
    const simpvResult = await firstValueFrom(dialogRef.afterClosed());
    if(!simpvResult) return;
    this.precinct = simpvPullStrategy(this.formGroup, simpvResult);
    this.formGroup.markAsDirty();
  }

  private getPvForm(): PVForm {
    return {
      id: this.existingForm?.id || uuidv4(),
      timestamp: Date.now(),
      electionId: this.election.id,
      pollId: this.poll.id,
      precinct: this.precinct,
      values: this.formGroup.value,
    };
  }

  getFieldCrossErrorDescription(fieldName: string) {
    const error = getFieldCrossErrors(this.formGroup.errors, fieldName)[0];
    return error ? error[1].message : null;
  }

  hasFieldCrossWarnings(fieldName: string) {
    const crossErrors = getFieldCrossErrors(this.formGroup.errors, fieldName).map(([_, error]) => error);
    return crossErrors.some(error => this.isWarning(error)) && !crossErrors.some(error => !this.isWarning(error));
  }

  getErrorMessage(error: any) {
    if(typeof error === 'string') {
      return error;
    }
    return error.message;
  }

  isWarning(error: any) {
    return error.type === 'warning';
  }

  getFormErrors() {
    const errors = Object.values(this.formGroup.errors || {});
    return errors.filter(error => !this.isWarning(error));
  }

  getFormWarnings() {
    const errors = Object.values(this.formGroup.errors || {});
    return errors.filter(error => this.isWarning(error));
  }

  formHasWarnings() {
    return this.getFormWarnings().length;
  }

  formHasErrors() {
    return this.getFormErrors().length;
  }
}

export const positive: ValidatorFn = (
  control: FormControl
): ValidationErrors | null => {
  return Number(control.value) < 0 ? { negative: true } : null;
};

function getFieldCrossErrors(formErrors: ValidationErrors | null, fieldName: any) {
  const errors = Object.entries(formErrors || {});
  /** Error ids are of form `field1_field2..._fieldN` */
  return errors.filter(([key]) => key.split('_').some(field => field === fieldName));
}

function getControlName(
  c: FormControl,
  directives: Array<FormControlName>
): string | number | null {
  return directives.find((name) => c == name.control).name || null;
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    const foreignInvalidity =
      form.form.errors &&
      getFieldCrossErrors(
        form.form.errors,
        getControlName(control, form.directives)
      ).length > 0;
    return control && (control.invalid || foreignInvalidity);
  }
}

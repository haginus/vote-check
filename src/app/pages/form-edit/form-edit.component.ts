import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormControlName,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService, PVForm } from '../../services/forms.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormSimpvDialogComponent } from '../../components/form-simpv-dialog/form-simpv-dialog.component';
import { FormDeleteDialogComponent } from '../../components/form-delete-dialog/form-delete-dialog.component';
import { FormExitDialogComponent } from '../../components/form-exit-dialog/form-exit-dialog.component';
import { Candidate } from '../../../elections/types';
import { CandidatesService } from '../../services/candidates.service';
import { getElection } from '../../../elections/elections';
import { v4 as uuidv4 } from 'uuid';
import { FormData } from '../../resolvers/form.resolver';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss'],
})
export class FormEditComponent implements OnInit, OnDestroy {

  loading: boolean = false;
  candidates: Candidate[] = [];
  matcher = new MyErrorStateMatcher();
  routeFormData = this.route.snapshot.data['formData'] as FormData;
  existingForm?: PVForm = this.routeFormData.form;
  election = this.routeFormData.election
  poll = this.routeFormData.poll;
  precinct = { county: 'CT', uatName: 'Municipiul Constanța', number: 1 };
  formGroup: FormGroup;
  calculateSubscription!: Subscription;

  constructor(
    private readonly formsService: FormsService,
    private readonly candidateService: CandidatesService,
    private route: ActivatedRoute,
    private router: Router,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  async ngOnInit() {
    this.candidates = await this.candidateService.getCandidates(this.election.id, this.poll.id, this.precinct);
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
    this.calculateSubscription.unsubscribe();
  }

  computeFields() {
    const fields = this.election.type.formStructure.sections.flatMap(section => section.fields);
    fields.forEach(field => {
      if(field.type !== 'computed') return;
      const value = field.computeFn(this.formGroup);
      this.formGroup.get(field.id)?.setValue(value, { emitEvent: false });
    });
  }

  showMessage(message: string) {
    this.snackBar.open(message, null, {
      duration: 3000,
      horizontalPosition: 'start',
    });
  }

  saveForm() {
    const form: PVForm = {
      id: this.existingForm?.id || uuidv4(),
      timestamp: Date.now(),
      electionId: this.election.id,
      pollId: this.poll.id,
      precinct: this.precinct,
      values: this.formGroup.value,
    }
    const action = this.existingForm
      ? this.formsService.editForm(form.id, form)
      : this.formsService.createForm(form);

    action.subscribe(() => {
      this.showMessage('Proces verbal salvat.');
      this.existingForm = form;
    });
  }

  askDeleteForm() {
    const dialogRef = this.dialog.open(FormDeleteDialogComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.deleteForm();
    });
  }

  deleteForm() {
    this.formsService.deleteForm(this.existingForm!.id).subscribe((_) => {
      this.router.navigate(['/']);
    });
  }

  getFieldCrossErrorDescription(fieldName: string) {
    const error = getFieldCrossError(this.formGroup.errors, fieldName);
    return error ? error[1] : null;
  }
}

export const positive: ValidatorFn = (
  control: FormControl
): ValidationErrors | null => {
  return Number(control.value) < 0 ? { negative: true } : null;
};

function getFieldCrossError(formErrors: ValidationErrors | null, fieldName: any) {
  const errors = Object.entries(formErrors || {});
  /** Error ids are of form `field1_field2..._fieldN` */
  return errors.find(([key]) => key.split('_').some(field => field === fieldName));
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
      !!getFieldCrossError(
        form.form.errors,
        getControlName(control, form.directives)
      );
    return control && (control.invalid || foreignInvalidity); //&& (control.dirty || control.touched)
  }
}

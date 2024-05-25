import { Component, OnDestroy, OnInit } from '@angular/core';
import {FormControl, FormControlName, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService, PVForm } from '../../services/forms.service'
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormSimpvDialogComponent } from '../../components/form-simpv-dialog/form-simpv-dialog.component';
import { FormDeleteDialogComponent } from '../../components/form-delete-dialog/form-delete-dialog.component';
import { FormExitDialogComponent } from '../../components/form-exit-dialog/form-exit-dialog.component';

@Component({
  selector: 'app-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss']
})
export class FormEditComponent implements OnInit, OnDestroy {
  form: PVForm = {
    _a: 0, a: [], _b: 0, b: [], c: 0, d: null, e: null, f: null, g: null, h: [], type: 'CDEP'
  }
  deleted: boolean = false
  loading: boolean = true
  formId : any
  candidates = {}
  matcher = new MyErrorStateMatcher();
  constructor(private formsService: FormsService, private route: ActivatedRoute, private router: Router, private location: Location,
    public dialog: MatDialog, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if(!params['id']) {
        this.formId = 'new'
        this.loading = false
        return
      }
      this.formId = +params['id'];
      this.formsService.getForm(this.formId).subscribe({
        next: (form) => {
          this.form = form
          this.resetForm();
        },
        error: (err) => {
          console.log(err)
          this.router.navigate(['']);
        },
        complete: () => this.loading = false
      })
    })
    this.formsService.getCandidates().subscribe(candidates => {this.candidates = candidates; console.log(candidates)})

    this.a.valueChanges.subscribe(val => {
      this.calculateA()
    });
    this.b.valueChanges.subscribe(val => {
      this.calculateB()
    });
    this.h().valueChanges.subscribe(val => {
      this.calculateE()
    });

    let hGroup = (this.formV.get('h') as FormGroup)
    for (let index = 0; index < 100; index++) {
      let control = new FormControl(null, [positive])
      hGroup.addControl('h' + (index + 1), control)
    }
  }

  ngOnDestroy() {
    if(this.formV.touched && !this.deleted) {
      const dialogRef = this.dialog.open(FormExitDialogComponent);
      dialogRef.afterClosed().subscribe(result => {
        if(result) this.saveForm();
      })
    }
  }

  resetForm() : void {
    this.formV.reset();
    this.a1.setValue(this.form.a[0])
    this.a2.setValue(this.form.a[1])
    this.a3.setValue(this.form.a[2])
    this.b1.setValue(this.form.b[0])
    this.b2.setValue(this.form.b[1])
    this.b3.setValue(this.form.b[2])
    this.c.setValue(this.form.c)
    this.d.setValue(this.form.d)
    this.f.setValue(this.form.f)
    this.g.setValue(this.form.g)
    for (let i = 0; i < 100; i++) {
      let h = this.h(i + 1)
      h.setValue(this.form.h[i])
    }
    this.type.setValue(this.form.type)
    this.calculateA();
    this.calculateB();
    this.calculateE();
  }

  calculateA() {
    this.form['_a']  = this.a1.value + this.a2.value + this.a3.value
  }

  calculateB() {
    this.form['_b']  = this.b1.value + this.b2.value + this.b3.value
  }

  calculateE() {
    let s = 0

    for (let index = 0; index < 100; index++) {
      const control = this.h(index + 1)
      if(control) s += control.value
    }
    this.form.e = s
  }

  showMessage(message : string) {
    this.snackBar.open(message, null, {
      duration: 3000,
      horizontalPosition: 'start'
    });
  }

  saveForm() {
    this.loading = true;
    this.calculateE()
    this.form.type = this.formV.value.type
    this.form.a = [0, 0, 0]
    if(this.a1.value) this.form.a[0] = this.a1.value
    if(this.a2.value) this.form.a[1] = this.a2.value
    if(this.a3.value) this.form.a[2] = this.a3.value
    this.form.b = [0, 0, 0]
    if(this.b1.value) this.form.b[0] = this.b1.value
    if(this.b2.value) this.form.b[1] = this.b2.value
    if(this.b3.value) this.form.b[2] = this.b3.value

    this.form.c = this.c.value ? this.c.value : 0
    this.form.d = this.d.value ? this.d.value : 0
    this.form.f = this.f.value ? this.f.value : 0
    this.form.g = this.g.value ? this.g.value : 0

    for (let i = 0; i < 100; i++) {
      const control = this.h(i + 1);
      this.form.h[i] = control.value ? control.value : 0

    }

    let form = {... this.form }
    delete form['_a']
    delete form['_b']
    if(this.formId == 'new') {
      this.formsService.createForm(form).subscribe(id => {
        this.formId = id;
        this.location.replaceState(`/form/${id}/edit`)
        this.resetForm();
        this.loading = false;
        this.showMessage('Proces-verbal salvat.');
      })
    }
    else {
      this.formsService.editForm(this.formId, form).subscribe(() => {
        this.resetForm();
        this.loading = false;
        this.showMessage('Proces-verbal salvat.');
      })

    }
  }

  askDeleteForm() {
    const dialogRef = this.dialog.open(FormDeleteDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result) this.deleteForm();
    });
  }

  deleteForm() {
    this.formsService.deleteForm(this.formId).subscribe(_ => {
      this.deleted = true
      this.router.navigate(['/']);
    })
  }

  simpvAutocomplete() {
    const dialogRef = this.dialog.open(FormSimpvDialogComponent);
    dialogRef.afterClosed().subscribe(precinct => {
      if(precinct) {
        this.a1.setValue(precinct.initial_count_lp)
        this.a2.setValue(precinct.LS)
        this.a3.setValue(precinct.UM)
        this.b1.setValue(precinct.LP)
        this.b2.setValue(precinct.LS)
        this.b3.setValue(precinct.UM)
        this.formV.markAsTouched();
      }
    })
  }

  formV = new FormGroup({
    'a': new FormGroup({
      'a1': new FormControl(null, [positive]),
      'a2': new FormControl(null, [positive]),
      'a3': new FormControl(null, [positive]),
    }),
    'b': new FormGroup({
      'b1': new FormControl(null, [positive]),
      'b2': new FormControl(null, [positive]),
      'b3': new FormControl(null, [positive]),
    }),
    'c': new FormControl(null, [positive]),
    'd': new FormControl(null, [positive]),
    'f': new FormControl(null, [positive]),
    'g': new FormControl(null, [positive]),
    'h': new FormGroup({}),
    'type': new FormControl(this.form.type, [])
  }, { validators: foreignKeyValidator });

  get a() { return this.formV.get("a") }
  get a1() { return this.formV.get("a.a1")}
  get a2() { return this.formV.get("a.a2")}
  get a3() { return this.formV.get("a.a3")}
  get b() { return this.formV.get("b") }
  get b1() { return this.formV.get("b.b1")}
  get b2() { return this.formV.get("b.b2")}
  get b3() { return this.formV.get("b.b3")}
  get c() { return this.formV.get("c")}
  get d() { return this.formV.get("d")}
  get f() { return this.formV.get("f")}
  get g() { return this.formV.get("g")}
  get type() { return this.formV.get("type") }
  h(i? : number) { return i ? this.formV.get("h.h" + i) : this.formV.get("h") }
}

export const positive: ValidatorFn = (control: FormControl): ValidationErrors | null => {
  return Number(control.value) < 0 ? { negative: true } : null;
};


export const foreignKeyValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const a1 = control.get('a.a1');
  const a2 = control.get('a.a2');
  const a3 = control.get('a.a3');
  const b1 = control.get('b.b1');
  const b2 = control.get('b.b2');
  const b3 = control.get('b.b3');
  let _b = b1.value + b2.value + b3.value
  let _e = 0
  for (let index = 0; index < 100; index++) {
    const s = control.get('h.h' + (index + 1))
    _e += s ? s.value : 0
  }
  const c = control.get('c')
  const d = control.get('d')
  const f = control.get('f')
  const g = control.get('g')
  let errors = {}
  if(a1 && b1 && a1.value < b1.value) errors['a1b1'] = true
  if(a2 && b2 && a2.value < b2.value) errors['a2b2'] = true
  if(a3 && b3 && a3.value < b3.value) errors['a3b3'] = true
  if(!(c.value >= d.value + _e + f.value + g.value)) errors['cdefg'] = true
  if(!(_e <= _b - (f.value + g.value))) errors['ebfg'] = true
  return Object.keys(errors).length ? errors : null;
};

function isIn(arr : string[], x : any) {
  if(x.startsWith('h')) x = 'ec' // if control name is h_, then we look for e errors
  return arr.find(el => el.includes(x)) ? true : false
}

function getControlName(c: FormControl, directives : Array<FormControlName>): string | number | null {
  return directives.find(name => c == name.control).name || null
}

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective): boolean {
    const foreignInvalidity = form.form.errors && isIn(Object.keys(form.form.errors), getControlName(control, form.directives))
    return control && (control.invalid || foreignInvalidity) //&& (control.dirty || control.touched)
  }
}

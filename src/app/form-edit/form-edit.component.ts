import { Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {FormControl, FormControlName, FormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsService } from '../forms.service'
import { Location } from '@angular/common';
import { observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SettingsComponent } from '../settings/settings.component';
import { SimpvPullService } from '../simpv-pull.service';
import { ConnectionService } from 'ng-connection-service';
@Component({
  selector: 'app-form-edit',
  templateUrl: './form-edit.component.html',
  styleUrls: ['./form-edit.component.scss']
})
export class FormEditComponent implements OnInit, OnDestroy {
  form: any = {
    _a: 0, a: [], _b: 0, b: [], c: 0, d: null, e: null, f: null, g: [], type: 'P'
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
    this.formsService.getCandidates().subscribe(candidates => this.candidates = candidates)

    this.a.valueChanges.subscribe(val => {
      this.calculateA()
    });
    this.b.valueChanges.subscribe(val => {
      this.calculateB()
    });
    this.g().valueChanges.subscribe(val => {
      this.calculateC()
    });
    
    let gGroup = (this.formV.get('g') as FormGroup)
    for (let index = 0; index < 30; index++) {
      let control = new FormControl(null, [positive])
      gGroup.addControl('g' + (index + 1), control)
    }
  }

  ngOnDestroy() {
    if(this.formV.touched && !this.deleted) {
      const dialogRef = this.dialog.open(DialogFormExit);
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
    this.a4.setValue(this.form.a[3])
    this.b1.setValue(this.form.b[0])
    this.b2.setValue(this.form.b[1])
    this.b3.setValue(this.form.b[2])
    this.b4.setValue(this.form.b[3])
    this.d.setValue(this.form.d)
    this.e.setValue(this.form.e)
    this.f.setValue(this.form.f)
    for (let i = 0; i < 30; i++) {
      let g = this.g(i + 1)
      g.setValue(this.form.g[i])
    }
    this.type.setValue(this.form.type)
    this.calculateA();
    this.calculateB();
    this.calculateC();
  }

  calculateA() {
    this.form._a  = this.a1.value + this.a2.value + this.a3.value + this.a4.value
  }

  calculateB() {
    this.form._b  = this.b1.value + this.b2.value + this.b3.value + this.b4.value
  }

  calculateC() {
    let s = 0

    for (let index = 0; index < 30; index++) {
      const control = this.g(index + 1)
      if(control) s += control.value
    }
    this.form.c = s
  }

  showMessage(message : string) {
    this.snackBar.open(message, null, {
      duration: 3000,
      horizontalPosition: 'start'
    });
  }

  saveForm() {
    this.loading = true;
    this.calculateC()
    this.form.type = this.formV.value.type
    this.form.a = [0, 0, 0, 0]
    if(this.a1.value) this.form.a[0] = this.a1.value
    if(this.a2.value) this.form.a[1] = this.a2.value
    if(this.a3.value) this.form.a[2] = this.a3.value
    if(this.a4.value) this.form.a[3] = this.a4.value
    this.form.b = [0, 0, 0, 0]
    if(this.b1.value) this.form.b[0] = this.b1.value
    if(this.b2.value) this.form.b[1] = this.b2.value
    if(this.b3.value) this.form.b[2] = this.b3.value
    if(this.b4.value) this.form.b[3] = this.b4.value

    this.form.d = this.d.value ? this.d.value : 0
    this.form.e = this.e.value ? this.e.value : 0
    this.form.f = this.f.value ? this.f.value : 0

    for (let i = 0; i < 30; i++) {
      const control = this.g(i + 1);
      this.form.g[i] = control.value ? control.value : 0
      
    }

    let form = {... this.form }
    delete form._a
    delete form._b
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
    const dialogRef = this.dialog.open(DialogFormDelete);
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
    const dialogRef = this.dialog.open(DialogFormSimpv);
    dialogRef.afterClosed().subscribe(precinct => {
      if(precinct) {
        this.a1.setValue(precinct.initial_count_lp)
        this.a2.setValue(precinct.initial_count_lc)
        this.a3.setValue(precinct.LS)
        this.a4.setValue(precinct.UM)
        this.b1.setValue(precinct.LP)
        this.b2.setValue(precinct.LC)
        this.b3.setValue(precinct.LS)
        this.b4.setValue(precinct.UM)
        this.formV.markAsTouched();
      }
    })
  }

  formV = new FormGroup({
    'a': new FormGroup({
      'a1': new FormControl(null, [positive]),
      'a2': new FormControl(null, [positive]),
      'a3': new FormControl(null, [positive]),
      'a4': new FormControl(null, [positive])
    }),
    'b': new FormGroup({
      'b1': new FormControl(null, [positive]),
      'b2': new FormControl(null, [positive]),
      'b3': new FormControl(null, [positive]),
      'b4': new FormControl(null, [positive])
    }),
    'd': new FormControl(null, [positive]),
    'e': new FormControl(null, [positive]),
    'f': new FormControl(null, [positive]),
    'g': new FormGroup({}),
    'type': new FormControl(this.form.type, [])
  }, { validators: foreignKeyValidator });

  get a() { return this.formV.get("a") }
  get a1() { return this.formV.get("a.a1")}
  get a2() { return this.formV.get("a.a2")}
  get a3() { return this.formV.get("a.a3")}
  get a4() { return this.formV.get("a.a4")}
  get b() { return this.formV.get("b") }
  get b1() { return this.formV.get("b.b1")}
  get b2() { return this.formV.get("b.b2")}
  get b3() { return this.formV.get("b.b3")}
  get b4() { return this.formV.get("b.b4")}
  get d() { return this.formV.get("d")}
  get e() { return this.formV.get("e")}
  get f() { return this.formV.get("f")}
  get type() { return this.formV.get("type") }
  g(i? : number) { return i ? this.formV.get("g.g" + i) : this.formV.get("g") }
}

export const positive: ValidatorFn = (control: FormControl): ValidationErrors | null => {
  return Number(control.value) < 0 ? { negative: true } : null;
};


export const foreignKeyValidator: ValidatorFn = (control: FormGroup): ValidationErrors | null => {
  const a1 = control.get('a.a1');
  const a2 = control.get('a.a2');
  const a3 = control.get('a.a3');
  const a4 = control.get('a.a4');
  const b1 = control.get('b.b1');
  const b2 = control.get('b.b2');
  const b3 = control.get('b.b3');
  const b4 = control.get('b.b4');
  let _b = b1.value + b2.value + b3.value + b4.value
  let _c = 0
  for (let index = 0; index < 30; index++) {
    const s = control.get('g.g' + (index + 1))
    _c += s ? s.value : 0
  }
  const d = control.get('d')
  const e = control.get('e')
  const f = control.get('f')
  let errors = {}
  if(a1 && b1 && a1.value < b1.value) errors['a1b1'] = true
  if(a2 && b2 && a2.value < b2.value) errors['a2b2'] = true
  if(a3 && b3 && a3.value < b3.value) errors['a3b3'] = true
  if(a4 && b4 && a4.value < b4.value) errors['a4b4'] = true
  if(d && !(_c <= _b - d.value)) errors['cbd'] = true
  if(e && d && f && !(e.value >= _c + d.value + f.value)) errors['ecdf'] = true
  return Object.keys(errors).length ? errors : null;
};

function isIn(arr : string[], x : any) {
  if(x.startsWith('g')) x = 'c' // if control name is g_, then we look for c errors 
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

// Dialog Form Exit 
@Component({
  selector: 'dialog-form-exit',
  templateUrl: '../dialog-templates/dialog-form-exit.html',
})
export class DialogFormExit {} 

// Dialog Form Delete 
@Component({
  selector: 'dialog-form-delete',
  templateUrl: '../dialog-templates/dialog-form-delete.html',
})
export class DialogFormDelete {} 

// Dialog Form SIMPV
@Component({
  selector: 'dialog-form-simpv',
  templateUrl: '../dialog-templates/dialog-form-simpv.html',
})
export class DialogFormSimpv implements OnInit {
  constructor(private simpv: SimpvPullService, private formsService: FormsService, private dialog: MatDialog, private connectionService: ConnectionService) {}
  precinct : any = null;
  settings : any;
  loading : boolean = true;
  online: boolean = navigator.onLine;

  ngOnInit() {
    this.connectionService.monitor().subscribe(online => {
      if(online == true && !this.online) 
        this.getPrecinctData();
      this.online = online
    });
    this.formsService.getSettings().subscribe(res => {
      this.settings = res;
      if(this.online) this.getPrecinctData();
      else this.loading = false;
    })
  }

  getPrecinctData() {
    this.loading = true;
    this.simpv.getPrecinct(this.settings.precinct, this.settings.county).subscribe(res => {
      this.loading = false;
      this.precinct = res;
    })
  }
  openSettings() {
    const dialogRef = this.dialog.open(SettingsComponent)
    dialogRef.afterClosed().subscribe((res) => {
      if(!res) {
        this.loading = false;
        return;
      }
      this.loading = true;
      this.formsService.getSettings().subscribe(res => {
        if(res != this.settings) {
          this.settings = res;
          if(this.online) this.getPrecinctData();
          else {
            this.loading = false;
            this.precinct = null;
          }
        } else this.loading = false;
      });
    })
  }
} 

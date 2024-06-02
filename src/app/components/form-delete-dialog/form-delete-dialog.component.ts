import { Component } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";

@Component({
  selector: 'app-form-delete-dialog',
  templateUrl: './form-delete-dialog.component.html',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
  ]
})
export class FormDeleteDialogComponent {}

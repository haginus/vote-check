import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Task, TaskSection } from '../tasks.service';
import { Router } from '@angular/router';
import { FormCreateDialogComponent } from '../../components/form-create-dialog/form-create-dialog.component';

@Component({
  selector: 'app-task-section',
  templateUrl: './task-section.component.html',
  styleUrls: ['./task-section.component.scss']
})
export class TaskSectionComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public section: TaskSection,
    private readonly router: Router,
    private readonly dialog: MatDialog,
  ) { }

  ngOnInit(): void {}

  tipLinkClicked(tipLink: Task['tipLink']) {
    if(tipLink.link) {
      this.router.navigate([tipLink.link]);
    } else if(tipLink.action) {
      switch(tipLink.action) {
        case 'createForm':
          this.dialog.open(FormCreateDialogComponent);
          break;
        default:
          break;
      }
    }
  }

}

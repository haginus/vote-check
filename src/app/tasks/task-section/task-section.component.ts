import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TaskSection } from '../tasks.service';

@Component({
  selector: 'app-task-section',
  templateUrl: './task-section.component.html',
  styleUrls: ['./task-section.component.scss']
})
export class TaskSectionComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public section: TaskSection) { }

  ngOnInit(): void {}

}

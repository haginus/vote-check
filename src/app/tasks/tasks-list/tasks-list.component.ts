import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { TaskSectionComponent } from '../task-section/task-section.component';
import { Task, TaskChapter, TasksService } from '../tasks.service';

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.scss']
})
export class TasksListComponent implements OnInit {

  constructor(private dialog: MatDialog, private tasksService: TasksService) { }

  tasks: TaskChapter[] = [];
  progress: { progress: number; sections: number[]; }[] = [];

  ngOnInit(): void {
    this.tasksService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.calculateProgress();
    })
  }

  openSection(chapter: number, section: number): void {
    const dialogRef = this.dialog.open(TaskSectionComponent, {
      data: this.tasks[chapter].sections[section]
    })

    dialogRef.afterClosed().subscribe(_ => {
      this.tasksService.setTasks(this.tasks).subscribe(_ => {});
      this.calculateProgress()
    });
  }

  private calculateProgress() {
    this.progress = []
    for(let chapter of this.tasks) {
      let chapterProgress = {
        progress: 0,
        sections: []
      }
      let totalTasks = 0;
      let totalTasksChecked = 0;
      for(let section of chapter.sections) {
        const sectionLists = section.content.filter(cnt => cnt.type === 'list');
        let tasks = sectionLists.reduce((acc : Task[], list) => acc.concat(list.tasks), [])
        let sectionProgress = tasks.filter(task => task.checked).length / tasks.length * 100;
        chapterProgress.sections.push(sectionProgress);
        if(!section.isOptional) {
          totalTasks += tasks.length;
          totalTasksChecked += tasks.filter(task => task.checked).length;
        }
      }
      chapterProgress.progress = totalTasksChecked / totalTasks * 100;
      this.progress.push(chapterProgress);
    }
  }

}



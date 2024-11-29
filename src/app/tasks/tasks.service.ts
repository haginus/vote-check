import { Injectable } from '@angular/core';
import { StorageMap } from '@ngx-pwa/local-storage';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import INITIAL_TASKS from './../../files/tasks.json'

@Injectable({
  providedIn: 'any'
})
export class TasksService {

  constructor(private storage: StorageMap) { }

  getTasks(): Observable<TaskChapter[]> {
    return this.storage.get('tasks').pipe(
      switchMap(tasks => {
        if(tasks === undefined || !isValid(tasks))
          return this.resetTasks();
        return of(tasks);
      })
    ) as Observable<TaskChapter[]>
  }

  setTasks(tasks: TaskChapter[]) : Observable<boolean> {
    if(isValid(tasks))
      return this.storage.set('tasks', tasks);
    return of(false);
  }

  private resetTasks(): Observable<TaskChapter[]> {
    return this.storage.set('tasks', INITIAL_TASKS).pipe(
      map(_ => INITIAL_TASKS)
    );
  }

}

const isValid = (_tasks: any) => {
  const initial_tasks : TaskChapter[] = INITIAL_TASKS;
  try {
    let tasks = JSON.parse(JSON.stringify(_tasks))

    for(let taskChapter of tasks) {
      for(let section of taskChapter.sections) {
        for(let content of section.content) {
          for(let task of content.tasks) {
            delete task.checked;
          }
        }
      }
    }

    if(JSON.stringify(initial_tasks) == JSON.stringify(tasks)) {
      return true;
    }
    else
      return false;
  } catch(e) {

    return false;
  }
}

export interface TaskChapter {
  chapterName: string;
  sections: TaskSection[];
}

export interface Task {
  taskName: string;
  checked: boolean;
  tip?: string;
  tipLink?: {
    linkText: string;
    link?: string;
    action?: string;
  }
}

export interface TaskSection {
  sectionName: string,
  reference?: string,
  isOptional?: boolean,
  content: TaskSectionContent[]
}

export interface TaskSectionContent {
  type: "list",
  text?: string,
  tasks?: Task[]
}

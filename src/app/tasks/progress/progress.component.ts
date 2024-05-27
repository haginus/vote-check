import { Component, ElementRef, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss']
})
export class ProgressComponent implements OnInit {

  constructor() { }

  @Input('diameter') diameter: number;
  @Input('progress') progress: number;

  ngOnInit(): void {}

}

import { NgClass, NgStyle } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.scss'],
  standalone: true,
  imports: [
    MatProgressSpinnerModule,
    MatIconModule,
    NgClass,
    NgStyle,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class ProgressComponent implements OnInit {

  constructor() { }

  @Input('diameter') diameter: number;
  @Input('progress') progress: number;

  ngOnInit(): void {}

}

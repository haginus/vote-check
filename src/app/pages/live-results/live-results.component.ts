import { ChangeDetectorRef, Component, NgZone } from '@angular/core';
import { CountyResults, Results, TotalResults } from '../../live-results/live-results-types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BigNumberPipe } from '../../pipes/big-number.pipe';
import { DecimalPipe } from '@angular/common';
import * as am5 from '@amcharts/amcharts5';
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import COUNTIES from '../../../files/counties.json';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ElectionResultsService } from '../../services/election-results.service';
import { environment } from '../../../environments/environment';
import { Election } from '../../../elections/types';
import { ElectionNamePipe } from '../../pipes/election-name.pipe';

@Component({
  selector: 'app-live-results',
  standalone: true,
  imports: [
    FormsModule,
    MatToolbarModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatSelectModule,
    MatTooltipModule,
    BigNumberPipe,
    DecimalPipe,
    ElectionNamePipe,
    RouterLink,
  ],
  templateUrl: './live-results.component.html',
  styleUrl: './live-results.component.scss'
})
export class LiveResultsComponent {

  constructor(
    private zone: NgZone,
    private resultsService: ElectionResultsService,
    private cd: ChangeDetectorRef,
  ) {
    this.changeSelectedElection(this.currentElections[0]);
  }

  protected currentElections = environment.currentElections;
  protected countiesIndex = COUNTIES;
  protected counties = Object.entries(COUNTIES);

  protected totalResults: TotalResults | null = null;
  protected showInvalidVotes = true;
  protected selectedElection!: Election;
  protected selectedCategory = 'EUP';
  private _selectedCountyCode: string | null = null;
  private _selectedResults: Results | null = this.totalResults;

  get selectedCountyCode() {
    return this._selectedCountyCode;
  }

  set selectedCountyCode(value: string | null) {
    if(this._selectedCountyCode && value !== this._selectedCountyCode) {
      this.zone.runOutsideAngular(() => {
        this.findPolygon(this._selectedCountyCode)?.setAll({
          stroke: am5.color(0x000000),
          strokeWidth: 0.5,
        })
      });
    }
    if(value) {
      this.zone.runOutsideAngular(() => {
        this.findPolygon(value)?.setAll({
          stroke: am5.color(0x673ab7),
          strokeWidth: 3,
        })
      });
    }
    this._selectedCountyCode = value;
    this.computeSelectedResults();
  }

  get selectedResults() {
    return this._selectedResults;
  }

  private root!: am5.Root;
  private polygonSeries!: am5map.MapPolygonSeries;

  private findPolygon(id: string) {
    return this.polygonSeries.mapPolygons.values.find(polygon => polygon.dataItem.dataContext['id'] === id);
  }

  async ngAfterViewInit() {
    const collection = (await import('../../../files/counties-geometry.json')) as any as GeoJSON.FeatureCollection;
    this.zone.runOutsideAngular(() => {
      const root = am5.Root.new("chartdiv");
      root.setThemes([
        am5themes_Animated.new(root)
      ]);
      const chart = root.container.children.push(
        am5map.MapChart.new(root, {
          panX: "rotateX",
          panY: "translateY",
          projection: am5map.geoMercator(),
        })
      );

      let zoomControl = chart.set("zoomControl", am5map.ZoomControl.new(root, {}));
      zoomControl.homeButton.set("visible", true);

      let polygonSeries = chart.series.push(
        am5map.MapPolygonSeries.new(root, {
          geoJSON: collection,
        })
      );

      this.root = root;
      this.polygonSeries = polygonSeries;

      polygonSeries.mapPolygons.template.setAll({
        tooltipText: "{name}",
        toggleKey: "active",
        interactive: true,
        stroke: am5.color(0x000000),
        strokeWidth: 0.5,
      });

      polygonSeries.mapPolygons.template.events.on("click", (event) => {
        const { target } = event;
        const countyCode = target.dataItem.dataContext['id'] as string;
        this.zone.run(() => {
          this.selectedCountyCode = countyCode === this._selectedCountyCode ? null : countyCode;
        });
      });

      chart.chartContainer.get("background").events.on("click", () => {
        chart.goHome();
        this.zone.run(() => {
          this.selectedCountyCode = null;
        });
      });
    });
  }

  private computeSelectedResults() {
    let results: Results | null = this.totalResults;
    if(this._selectedCountyCode) {
      results = this.totalResults.counties.find(c => c.countyCode === this._selectedCountyCode);
    }
    this._selectedResults = results;
    this.cd.detectChanges();
  }

  protected changeSelectedElection(election: Election) {
    this.totalResults = null;
    this._selectedResults = null;
    this.selectedElection = election;
    this.selectedCategory = election.type.polls.find(p => !!p.sicpvId)?.['sicpvId'];
    this.getTotalResults();
  }

  private async getTotalResults() {
    this.totalResults = await firstValueFrom(this.resultsService.getCountryResults(this.selectedElection.id));
    this.updateMapData();
    this.computeSelectedResults();
  }

  updateMapData() {
    if(!this.totalResults) return;
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const counties = this.totalResults.counties.reduce(
          (acc, c) => ({ ...acc, [c.countyCode]: c }),
          {} as Record<string, CountyResults>
        );
        this.polygonSeries?.mapPolygons.each((polygon) => {
          const data = counties[polygon.dataItem.dataContext['id']];
          polygon.setAll({
            fill: am5.color(0x005cbb),
            fillOpacity: data ? data.countedVotes / data.castVotes : 0,
          })
        });
      }, 1);
    });
  }

  ngOnDestroy() {
    this.zone.runOutsideAngular(() => {
      if (this.root) {
        this.root.dispose();
      }
    });
  }


}

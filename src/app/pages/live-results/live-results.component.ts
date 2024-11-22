import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CountyResults, PrecinctResults, Results, TotalResults } from '../../live-results/live-results-types';
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
import { indexArray } from '../../../../tools/utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule,
    BigNumberPipe,
    DecimalPipe,
    ElectionNamePipe,
    RouterLink,
  ],
  templateUrl: './live-results.component.html',
  styleUrl: './live-results.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveResultsComponent {

  constructor(
    private readonly resultsService: ElectionResultsService,
    private readonly snackBar: MatSnackBar,
  ) {
    this.changeSelectedElection(this.currentElections[0]);
  }

  protected currentElections = environment.currentElections;
  protected countiesIndex = COUNTIES;

  private intervalId: any;
  protected lastUpdated = signal<Date | null>(null);
  protected error = signal(false);
  protected isLoading = signal(false);
  protected totalResults = signal<TotalResults | null>(null);
  protected showInvalidVotes = signal(true);
  protected selectedElection = signal<Election>(this.currentElections[0]);
  protected selectedCategory = signal<string>('');
  protected selectedCountyCode = signal<string | null>(null);
  protected selectedCountyResults = signal<CountyResults | null>(null);
  protected selectedPrecinct = signal<PrecinctResults | null>(null);
  protected availableConstituencies = computed(() => {
    if(!this.selectedElection()) return [];
    if(this.selectedElection().constituencies) {
      return this.selectedElection().constituencies.map(c => ({ code: c.countyCode, name: COUNTIES[c.countyCode] }))
    }
    return Object.keys(COUNTIES).map((code) => ({ code, name: COUNTIES[code] }));
  });
  protected selectedCountyUats = computed(() => {
    if(!this.selectedCountyResults()) return [];
    return Object.values(indexArray(this.selectedCountyResults().precincts.map(p => p.uat), uat => uat.id));
  });
  protected selectedResults = computed(() => {
    let results: Results | null = this.totalResults();
    if (this.selectedCountyCode()) {
      results = this.selectedCountyResults() || this.totalResults().counties.find(c => c.countyCode === this.selectedCountyCode());
    }
    if(this.selectedCountyResults()) {
      if(this.selectedPrecinct()) {
        results = this.selectedPrecinct();
      }
    }
    return results;
  })

  setSelectedCountyCode(value: string | null) {
    if(!this.totalResults()) return;
    if(value && !this.availableConstituencies().find(c => c.code === value)) return;
    if (this.selectedCountyCode() && value !== this.selectedCountyCode()) {
      this.findPolygon(this.selectedCountyCode())?.setAll({
        stroke: am5.color(0x000000),
        strokeWidth: 0.5,
      });
      this.selectedPrecinct.set(null);
      this.selectedCountyResults.set(null);
    }
    if (value) {
      this.findPolygon(value)?.setAll({
        stroke: am5.color(0x673ab7),
        strokeWidth: 3,
      });
    }
    this.selectedCountyCode.set(value);
    this.getCountyResults();
  }

  private root!: am5.Root;
  private polygonSeries!: am5map.MapPolygonSeries;

  private findPolygon(id: string) {
    return this.polygonSeries.mapPolygons.values.find(polygon => polygon.dataItem.dataContext['id'] === id);
  }

  async ngAfterViewInit() {
    const collection = (await import('../../../files/counties-geometry.json')) as any as GeoJSON.FeatureCollection;
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
      this.setSelectedCountyCode(countyCode === this.selectedCountyCode() ? null : countyCode);
    });

    chart.chartContainer.get("background").events.on("click", () => {
      chart.goHome();
      this.setSelectedCountyCode(null);
    });

    let mapLoaded = false;
    root.events.on("frameended", () => {
      if(!mapLoaded) {
        mapLoaded = true;
        this.updateMapData();
      }
    });
  }

  protected changeSelectedElection(election: Election) {
    this.setSelectedCountyCode(null);
    this.totalResults.set(null);
    this.selectedPrecinct.set(null);
    this.selectedCountyResults.set(null);
    this.selectedElection.set(election);
    this.selectedCategory.set(election.type.polls.find(p => !!p.sicpvId)?.['sicpvId']);
    this.getTotalResults(true);
    clearInterval(this.intervalId);
    this.intervalId = setInterval(() => {
      this.getTotalResults();
      this.getCountyResults();
    }, 60000);
  }

  protected async getTotalResults(initialLoad = false) {
    try {
      this.totalResults.set(
        await this.loadData(
          firstValueFrom(this.resultsService.getCountryResults(this.selectedElection().id)),
          initialLoad
        )
      );
      this.lastUpdated.set(new Date());
      if(this.availableConstituencies().length === 1) {
        this.setSelectedCountyCode(this.availableConstituencies()[0].code);
      }
    } finally {
      this.updateMapData();
    }
  }

  private async getCountyResults() {
    if (this.selectedCountyCode()) {
      const results = await this.loadData(
        firstValueFrom(this.resultsService.getCountyResults(this.selectedElection().id, this.selectedCountyCode()))
      );
      this.lastUpdated.set(new Date());
      this.selectedCountyResults.set(results);
    }
  }

  private async loadData<T>(promise: Promise<T>, fatalError = false) {
    const loadTime = Date.now();
    const sbRef = this.snackBar.open("Datele se actualizează...", null, { duration: -1 });
    this.isLoading.set(true);
    try {
      const result = await promise;
      this.error.set(false);
      return result;
    } catch(err) {
      this.snackBar.open("A apărut o eroare la încărcarea datelor.");
      if(fatalError) {
        this.error.set(true);
      }
      throw err;
    } finally {
      setTimeout(() => {
        sbRef.dismiss();
      }, 500 - (Date.now() - loadTime))
      this.isLoading.set(false);
    }
  }

  updateMapData() {
    const counties = this.totalResults()?.counties.reduce(
      (acc, c) => ({ ...acc, [c.countyCode]: c }),
      {} as Record<string, CountyResults>
    ) || {};
    this.polygonSeries?.mapPolygons.each((polygon) => {
      const data = counties[polygon.dataItem.dataContext['id']];
      polygon.setAll({
        fill: am5.color(0x005cbb),
        fillOpacity: data?.castVotes ? data.countedVotes / data.castVotes : 0,
      })
    });
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.dispose();
    }
    clearInterval(this.intervalId);
  }

}

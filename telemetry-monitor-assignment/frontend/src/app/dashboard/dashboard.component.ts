import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, catchError, of, switchMap, timer } from 'rxjs';
import { TelemetryCardComponent } from '../components/telemetry-card/telemetry-card.component';
import { DashboardService } from '../services/dashboard.service';
import { ExportService } from '../services/export.service';
import { UnitConversionService } from '../services/unit-conversion.service';
import { DashboardResponse, HistoryPoint, MetricDefinition, MetricName } from '../models/telemetry.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TelemetryCardComponent],
  styleUrl: './dashboard.style.scss',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly dashboardService = inject(DashboardService);
  private readonly conversionService = inject(UnitConversionService);
  private readonly exportService = inject(ExportService);
  private subscription?: Subscription;

  readonly definitions: MetricDefinition[] = [
    { key: 'velocity', label: 'Velocity', baseUnit: 'cm/s', units: ['mm/s', 'cm/s', 'm/s', 'km/h', 'ft/s'], min: 0, max: 300 },
    { key: 'pressure', label: 'Pressure', baseUnit: 'mbar', units: ['Pa', 'kPa', 'mbar', 'bar', 'psi', 'atm'], min: 900, max: 1100 },
    { key: 'temperature', label: 'Temperature', baseUnit: '°C', units: ['°C', '°F', 'K'], min: 0, max: 80 }
  ];

  units: Record<MetricName, string> = {
    velocity: 'cm/s',
    pressure: 'mbar',
    temperature: '°C'
  };

  dashboard: DashboardResponse | null = null;
  loading = true;
  errorMessage = '';
  connectionStatus = 'Connecting';
  lastSuccessfulUpdate = '';
  darkMode = false;

  ngOnInit(): void {
    this.darkMode = localStorage.getItem('telemetry-theme') === 'dark';
    document.documentElement.classList.toggle('dark-theme', this.darkMode);
    this.startPolling();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get hasData(): boolean {
    return this.dashboard !== null;
  }

  startPolling(): void {
    this.subscription?.unsubscribe();
    this.subscription = timer(0, 1000).pipe(
      switchMap(() => this.dashboardService.getDashboard().pipe(
        catchError(() => {
          this.connectionStatus = 'Offline';
          this.errorMessage = 'Unable to reach the telemetry backend. Retrying automatically.';
          this.loading = false;
          return of(null);
        })
      ))
    ).subscribe((response) => {
      if (!response) {
        return;
      }
      this.dashboard = response;
      this.loading = false;
      this.errorMessage = '';
      this.connectionStatus = 'Connected';
      this.lastSuccessfulUpdate = response.timestamp;
    });
  }

  loadNow(): void {
    this.loading = true;
    this.errorMessage = '';
    this.dashboardService.getDashboard().subscribe({
      next: (response) => {
        this.dashboard = response;
        this.loading = false;
        this.connectionStatus = 'Connected';
        this.lastSuccessfulUpdate = response.timestamp;
      },
      error: () => {
        this.loading = false;
        this.connectionStatus = 'Offline';
        this.errorMessage = 'Backend is still unavailable. The application will keep retrying.';
      }
    });
  }

  changeUnit(metric: MetricName, unit: string): void {
    this.units = { ...this.units, [metric]: unit };
  }

  getDisplayDefinition(definition: MetricDefinition): MetricDefinition {
    return {
      ...definition,
      min: this.convert(definition.key, definition.min),
      max: this.convert(definition.key, definition.max)
    };
  }

  displayValue(metric: MetricName): number {
    const value = this.dashboard?.[metric].value ?? 0;
    return this.convert(metric, value);
  }

  displayHistory(metric: MetricName): HistoryPoint[] {
    return (this.dashboard?.[metric].history ?? []).map((point) => ({
      time: point.time,
      value: this.convert(metric, point.value)
    }));
  }

  getStatus(metric: MetricName): string {
    const value = this.dashboard?.[metric].value ?? 0;

    if (metric === 'velocity') {
      return value > 230 ? 'Critical' : value > 210 ? 'Warning' : 'Normal';
    }

    if (metric === 'pressure') {
      return value < 950 || value > 1070 ? 'Critical' : value < 980 || value > 1040 ? 'Warning' : 'Normal';
    }

    return value > 55 ? 'Critical' : value > 48 ? 'Warning' : 'Normal';
  }

  exportCsv(): void {
    const rows = this.getExportRows();
    this.exportService.exportCsv(rows, this.units);
  }

  exportExcel(): void {
    const rows = this.getExportRows();
    this.exportService.exportExcel(rows, this.units);
  }

  toggleTheme(): void {
    this.darkMode = !this.darkMode;
    localStorage.setItem('telemetry-theme', this.darkMode ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark-theme', this.darkMode);
  }

  private convert(metric: MetricName, value: number): number {
    const definition = this.definitions.find((item) => item.key === metric)!;
    return this.conversionService.convert(metric, value, definition.baseUnit, this.units[metric]);
  }

  private getExportRows() {
    return this.exportService.createRows({
      velocity: this.dashboard?.velocity.history ?? [],
      pressure: this.dashboard?.pressure.history ?? [],
      temperature: this.dashboard?.temperature.history ?? []
    }, (metric, value) => this.convert(metric, value));
  }
}

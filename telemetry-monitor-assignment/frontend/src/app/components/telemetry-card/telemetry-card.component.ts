import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GaugeComponent } from '../gauge/gauge.component';
import { TrendChartComponent } from '../trend-chart/trend-chart.component';
import { HistoryPoint, MetricDefinition } from '../../models/telemetry.model';

@Component({
  selector: 'app-telemetry-card',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, FormsModule, GaugeComponent, TrendChartComponent],
  styleUrl: './telemetry-card.component.scss',
  templateUrl: './telemetry-card.component.html',
})
export class TelemetryCardComponent {
  @Input({ required: true }) definition!: MetricDefinition;
  @Input() value = 0;
  @Input() selectedUnit = '';
  @Input() status = 'Normal';
  @Input() updatedAt = '';
  @Input() history: HistoryPoint[] = [];
  @Output() unitChange = new EventEmitter<string>();
}

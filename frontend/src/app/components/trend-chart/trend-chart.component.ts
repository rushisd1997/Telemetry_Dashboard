import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from '@angular/core';

import {
  Chart,
  ChartConfiguration,
  registerables
} from 'chart.js';

import zoomPlugin from 'chartjs-plugin-zoom';
import { formatTime } from '../../utils';

Chart.register(...registerables, zoomPlugin);

export interface ChartPoint {
  time: string;
  value: number;
}

@Component({
  selector: 'app-trend-chart',
  standalone: true,
  templateUrl: './trend-chart.component.html',
  styleUrl: './trend-chart.component.scss'
})
export class TrendChartComponent
  implements AfterViewInit, OnChanges, OnDestroy {

  @Input() data: ChartPoint[] = [];
  @Input() unit = '';
  @Input() label = '';

  @ViewChild('chartCanvas')
  chartCanvas!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  ngAfterViewInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.chart) {
      this.updateChart();
    }
  }

  private createChart(): void {
    if (!this.chartCanvas) {
      return;
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: this.data.map(point => formatTime(point.time)),
        datasets: [
          {
            label: this.label,
            data: this.data.map(point => point.value),
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.3,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,

        interaction: {
          intersect: false,
          mode: 'index'
        },

        plugins: {
          legend: {
            display: false
          },

          tooltip: {
            callbacks: {
              title: context => {
                const index = context[0].dataIndex;
                return formatTime(this.data[index].time);
              },
              label: context => {
                return `${context.parsed.y} ${this.unit}`;
              }
            }
          },

          zoom: {
            pan: {
              enabled: true,
              mode: 'x'
            },

            zoom: {
              wheel: {
                enabled: true
              },
              pinch: {
                enabled: true
              },
              drag: {
                enabled: true
              },
              mode: 'x'
            }
          }
        },

        scales: {
          x: {
            title: {
              display: true,
              text: 'Time'
            }
          },

          y: {
            title: {
              display: true,
              text: this.unit
            }
          }
        }
      }
    };

    this.chart = new Chart(
      this.chartCanvas.nativeElement,
      config
    );
  }

  private updateChart(): void {
    if (!this.chart) {
      return;
    }

    this.chart.data.labels =
      this.data.map(point => formatTime(point.time));

    this.chart.data.datasets[0].data =
      this.data.map(point => point.value);

    this.chart.update('none');
  }

  zoomIn(): void {
    this.chart?.zoom(1.2);
  }

  zoomOut(): void {
    this.chart?.zoom(0.8);
  }

  resetZoom(): void {
    this.chart?.resetZoom();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }
}
import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { HistoryPoint, MetricName } from '../models/telemetry.model';

export interface ExportRow {
  timestamp: string;
  velocity: number;
  pressure: number;
  temperature: number;
}

@Injectable({ providedIn: 'root' })
export class ExportService {
  exportCsv(rows: ExportRow[], units: Record<MetricName, string>): void {
    const header = `Timestamp,Velocity (${units.velocity}),Pressure (${units.pressure}),Temperature (${units.temperature})`;
    const body = rows.map((row) => [
      row.timestamp,
      row.velocity,
      row.pressure,
      row.temperature
    ].join(','));

    this.download(`${header}\n${body.join('\n')}`, 'telemetry.csv', 'text/csv');
  }

  exportExcel(rows: ExportRow[], units: Record<MetricName, string>): void {
    const data = rows.map((row) => ({
      Timestamp: row.timestamp,
      [`Velocity (${units.velocity})`]: row.velocity,
      [`Pressure (${units.pressure})`]: row.pressure,
      [`Temperature (${units.temperature})`]: row.temperature
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Telemetry');
    XLSX.writeFile(workbook, 'telemetry.xlsx');
  }

  createRows(
    histories: { velocity: HistoryPoint[]; pressure: HistoryPoint[]; temperature: HistoryPoint[] },
    convert: (metric: MetricName, value: number) => number
  ): ExportRow[] {
    const rowCount = Math.max(histories.velocity.length, histories.pressure.length, histories.temperature.length);

    return Array.from({ length: rowCount }, (_, index) => {
      const velocity = histories.velocity[index];
      const pressure = histories.pressure[index];
      const temperature = histories.temperature[index];

      return {
        timestamp: velocity?.time ?? pressure?.time ?? temperature?.time ?? '',
        velocity: velocity ? convert('velocity', velocity.value) : 0,
        pressure: pressure ? convert('pressure', pressure.value) : 0,
        temperature: temperature ? convert('temperature', temperature.value) : 0
      };
    });
  }

  private download(content: string, filename: string, type: string): void {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}

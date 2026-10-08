export interface HistoryPoint {
  time: string;
  value: number;
}

export interface MetricData {
  value: number;
  unit: string;
  history: HistoryPoint[];
}

export interface DashboardResponse {
  timestamp: string;
  velocity: MetricData;
  pressure: MetricData;
  temperature: MetricData;
}

export type MetricName = 'velocity' | 'pressure' | 'temperature';

export interface MetricDefinition {
  key: MetricName;
  label: string;
  baseUnit: string;
  units: string[];
  min: number;
  max: number;
}

import { Injectable } from '@angular/core';
import { MetricName } from '../models/telemetry.model';

@Injectable({ providedIn: 'root' })
export class UnitConversionService {
  convert(metric: MetricName, value: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) {
      return value;
    }

    if (metric === 'velocity') {
      return this.convertVelocity(value, fromUnit, toUnit);
    }

    if (metric === 'pressure') {
      return this.convertPressure(value, fromUnit, toUnit);
    }

    return this.convertTemperature(value, fromUnit, toUnit);
  }

  private convertVelocity(value: number, from: string, to: string): number {
    const cmPerSecond = {
      'mm/s': value * 10,
      'cm/s': value,
      'm/s': value * 0.01,
      'km/h': value * 0.036,
      'ft/s': value * 0.0328084
    }[from];

    const base = cmPerSecond ?? value;
    return this.round({
      'mm/s': base * 10,
      'cm/s': base,
      'm/s': base * 0.01,
      'km/h': base * 0.036,
      'ft/s': base * 0.0328084
    }[to] ?? base);
  }

  private convertPressure(value: number, from: string, to: string): number {
    const pascal = {
      Pa: value,
      kPa: value * 1000,
      mbar: value * 100,
      bar: value * 100000,
      psi: value * 6894.757293,
      atm: value * 101325
    }[from];

    const base = pascal ?? value;
    return this.round({
      Pa: base,
      kPa: base / 1000,
      mbar: base / 100,
      bar: base / 100000,
      psi: base / 6894.757293,
      atm: base / 101325
    }[to] ?? base);
  }

  private convertTemperature(value: number, from: string, to: string): number {
    let celsius = value;

    if (from === '°F') {
      celsius = (value - 32) * 5 / 9;
    } else if (from === 'K') {
      celsius = value - 273.15;
    }

    if (to === '°F') {
      return this.round(celsius * 9 / 5 + 32);
    }

    if (to === 'K') {
      return this.round(celsius + 273.15);
    }

    return this.round(celsius);
  }

  private round(value: number): number {
    return Number(value.toFixed(2));
  }
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatRate(rate: number): string {
  return rate.toFixed(1);
}

export function getDiseaseColor(rate: number): string {
  if (rate <= 5) return 'var(--data-lowest)';
  if (rate <= 10) return 'var(--data-low)';
  if (rate <= 15) return 'var(--data-medium)';
  if (rate <= 20) return 'var(--data-high)';
  return 'var(--data-highest)';
}

export function getPrevalencePercentage(rate: number, maxRate: number = 25): number {
  return Math.min(100, (rate / maxRate) * 100);
}

export function getDiseaseInfo(diseaseType: string) {
  const diseases = {
    diabetes: { name: 'Diabetes', icdCodes: 'E10-E14' },
    hypertension: { name: 'Hypertension', icdCodes: 'I10-I15' },
    heart: { name: 'Heart Disease', icdCodes: 'I20-I25' },
    copd: { name: 'COPD', icdCodes: 'J40-J44' },
    asthma: { name: 'Asthma', icdCodes: 'J45' },
  };
  
  return diseases[diseaseType as keyof typeof diseases] || { name: 'Unknown', icdCodes: '' };
}

export function calculateDensity(population: number, areaKm2: number): number {
  // Convert to per square mile and round
  const densityPerSqMile = (population / areaKm2) * 2.58999;
  return Math.round(densityPerSqMile);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

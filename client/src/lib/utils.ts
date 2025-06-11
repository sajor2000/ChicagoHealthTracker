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
    stroke: { name: 'Stroke', icdCodes: 'I60-I69' },
    ckd: { name: 'Chronic Kidney Disease', icdCodes: 'N18' },
    depression: { name: 'Depression', icdCodes: 'F32-F33' },
    anxiety: { name: 'Anxiety Disorders', icdCodes: 'F40-F41' },
    obesity: { name: 'Obesity', icdCodes: 'E66' },
    cancer: { name: 'Cancer', icdCodes: 'C00-C97' },
    arthritis: { name: 'Arthritis', icdCodes: 'M05-M06, M15-M19' },
    osteoporosis: { name: 'Osteoporosis', icdCodes: 'M80-M81' },
    liver: { name: 'Liver Disease', icdCodes: 'K70-K77' },
    substance: { name: 'Substance Use Disorder', icdCodes: 'F10-F19' },
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

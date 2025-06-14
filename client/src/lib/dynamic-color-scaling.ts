/**
 * Dynamic color scaling based on data quartiles for visually appealing gradients
 * Ensures proper color distribution regardless of actual disease prevalence values
 */

export interface ColorScale {
  min: number;
  q25: number;
  median: number;
  q75: number;
  q90: number;
  q95: number;
  max: number;
}

/**
 * Calculate quartiles from actual data for dynamic color scaling
 */
export function calculateQuartiles(data: GeoJSON.FeatureCollection, disease: string, mode: 'count' | 'rate'): ColorScale {
  const propertyKey = `${disease}_${mode}`;
  
  // Extract all values and filter out suppressed/invalid data
  const values = data.features
    .map(feature => feature.properties?.[propertyKey])
    .filter(value => value !== undefined && value !== null && value > 0)
    .sort((a, b) => a - b);

  if (values.length === 0) {
    return { min: 0, q25: 5, median: 10, q75: 15, q90: 20, q95: 25, max: 30 };
  }

  const n = values.length;
  
  return {
    min: values[0],
    q25: values[Math.floor(n * 0.25)],
    median: values[Math.floor(n * 0.5)],
    q75: values[Math.floor(n * 0.75)],
    q90: values[Math.floor(n * 0.9)],
    q95: values[Math.floor(n * 0.95)],
    max: values[n - 1]
  };
}

/**
 * Generate Mapbox color expression using dynamic quartiles
 */
export function createDynamicColorExpression(quartiles: ColorScale, propertyKey: string): any[] {
  return [
    'case',
    ['>', ['get', propertyKey], 0],
    [
      'interpolate', 
      ['linear'], 
      ['get', propertyKey],
      quartiles.min, '#006747',      // Dark green - lowest values
      quartiles.q25, '#4a8c2a',     // Medium green - 25th percentile
      quartiles.median, '#a4c441',  // Yellow-green - median
      quartiles.q75, '#f4e04d',     // Yellow - 75th percentile
      quartiles.q90, '#ff8c42',     // Orange - 90th percentile
      quartiles.q95, '#f76c5e',     // Red - 95th percentile
      quartiles.max, '#d32f2f'      // Dark red - maximum values
    ],
    'rgba(107, 114, 128, 0.3)' // Suppressed data color
  ];
}

/**
 * Get appropriate color scale thresholds for legend display
 */
export function getLegendThresholds(quartiles: ColorScale): { value: number; label: string; color: string }[] {
  return [
    { value: quartiles.min, label: `${Math.round(quartiles.min)}`, color: '#006747' },
    { value: quartiles.q25, label: `${Math.round(quartiles.q25)}`, color: '#4a8c2a' },
    { value: quartiles.median, label: `${Math.round(quartiles.median)}`, color: '#a4c441' },
    { value: quartiles.q75, label: `${Math.round(quartiles.q75)}`, color: '#f4e04d' },
    { value: quartiles.q90, label: `${Math.round(quartiles.q90)}`, color: '#ff8c42' },
    { value: quartiles.q95, label: `${Math.round(quartiles.q95)}`, color: '#f76c5e' },
    { value: quartiles.max, label: `${Math.round(quartiles.max)}+`, color: '#d32f2f' }
  ];
}
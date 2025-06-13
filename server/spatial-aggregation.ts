// Spatial aggregation utilities for Chicago health data
// Aggregates census tract data to community areas and wards based on geographic overlap

interface Point {
  lng: number;
  lat: number;
}

interface Polygon {
  coordinates: number[][][];
}

interface CensusTract {
  id: string;
  population: number;
  density: number;
  diseases: Record<string, any>;
  geometry: Polygon;
  centroid?: Point;
}

interface GeographicUnit {
  id: string;
  name: string;
  geometry: Polygon;
  population?: number;
}

/**
 * Calculate the centroid of a polygon
 */
function calculateCentroid(coordinates: number[][][]): Point {
  const ring = coordinates[0]; // Use first ring (outer boundary)
  let totalLng = 0;
  let totalLat = 0;
  let count = 0;

  for (const coord of ring) {
    totalLng += coord[0];
    totalLat += coord[1];
    count++;
  }

  return {
    lng: totalLng / count,
    lat: totalLat / count
  };
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
function pointInPolygon(point: Point, polygon: number[][]): boolean {
  const { lng, lat } = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];

    if (((yi > lat) !== (yj > lat)) && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }

  return inside;
}

/**
 * Calculate approximate overlap area between two polygons using grid sampling
 * Returns a value between 0 and 1 representing the proportion of tract area within the unit
 */
function calculateOverlapRatio(tractGeometry: Polygon, unitGeometry: Polygon): number {
  const tractRing = tractGeometry.coordinates[0];
  const unitRing = unitGeometry.coordinates[0];

  // Get bounding box of tract
  let minLng = Infinity, maxLng = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;

  for (const coord of tractRing) {
    minLng = Math.min(minLng, coord[0]);
    maxLng = Math.max(maxLng, coord[0]);
    minLat = Math.min(minLat, coord[1]);
    maxLat = Math.max(maxLat, coord[1]);
  }

  // Sample points within tract bounding box
  const gridSize = 20; // 20x20 grid for sampling
  const lngStep = (maxLng - minLng) / gridSize;
  const latStep = (maxLat - minLat) / gridSize;

  let totalPoints = 0;
  let pointsInUnit = 0;

  for (let i = 0; i <= gridSize; i++) {
    for (let j = 0; j <= gridSize; j++) {
      const testPoint: Point = {
        lng: minLng + i * lngStep,
        lat: minLat + j * latStep
      };

      // Check if point is in tract
      if (pointInPolygon(testPoint, tractRing)) {
        totalPoints++;
        
        // Check if point is also in unit
        if (pointInPolygon(testPoint, unitRing)) {
          pointsInUnit++;
        }
      }
    }
  }

  return totalPoints > 0 ? pointsInUnit / totalPoints : 0;
}

/**
 * Find all census tracts that overlap with a geographic unit and calculate overlap ratios
 */
function findOverlappingTracts(unit: GeographicUnit, tracts: CensusTract[]): Array<{tract: CensusTract, overlapRatio: number}> {
  const overlaps: Array<{tract: CensusTract, overlapRatio: number}> = [];

  for (const tract of tracts) {
    // First check if tract centroid is in unit (fast check)
    const centroid = tract.centroid || calculateCentroid(tract.geometry.coordinates);
    tract.centroid = centroid;

    const unitRing = unit.geometry.coordinates[0];
    const centroidInUnit = pointInPolygon(centroid, unitRing);

    if (centroidInUnit) {
      // If centroid is inside, assume full overlap for performance
      overlaps.push({ tract, overlapRatio: 1.0 });
    } else {
      // Calculate detailed overlap for boundary cases
      const overlapRatio = calculateOverlapRatio(tract.geometry, unit.geometry);
      if (overlapRatio > 0.1) { // Only include if significant overlap (>10%)
        overlaps.push({ tract, overlapRatio });
      }
    }
  }

  return overlaps;
}

/**
 * Aggregate disease data from overlapping census tracts using population-weighted averages
 */
function aggregateDiseaseData(overlaps: Array<{tract: CensusTract, overlapRatio: number}>): {
  diseases: Record<string, any>,
  totalPopulation: number,
  weightedDensity: number
} {
  if (overlaps.length === 0) {
    return {
      diseases: {},
      totalPopulation: 0,
      weightedDensity: 0
    };
  }

  // Calculate total weighted population
  let totalWeightedPopulation = 0;
  let totalWeightedDensity = 0;
  const diseaseAggregates: Record<string, {totalCount: number, totalWeightedRate: number, weightSum: number}> = {};

  for (const { tract, overlapRatio } of overlaps) {
    const weight = tract.population * overlapRatio;
    totalWeightedPopulation += weight;
    totalWeightedDensity += tract.density * weight;

    // Aggregate each disease
    for (const [diseaseId, diseaseData] of Object.entries(tract.diseases)) {
      if (!diseaseAggregates[diseaseId]) {
        diseaseAggregates[diseaseId] = {
          totalCount: 0,
          totalWeightedRate: 0,
          weightSum: 0
        };
      }

      const aggregate = diseaseAggregates[diseaseId];
      aggregate.totalCount += diseaseData.count * overlapRatio;
      aggregate.totalWeightedRate += diseaseData.rate * weight;
      aggregate.weightSum += weight;
    }
  }

  // Calculate final aggregated values
  const diseases: Record<string, any> = {};
  for (const [diseaseId, aggregate] of Object.entries(diseaseAggregates)) {
    const avgRate = aggregate.weightSum > 0 ? aggregate.totalWeightedRate / aggregate.weightSum : 0;
    diseases[diseaseId] = {
      id: diseaseId,
      name: overlaps[0].tract.diseases[diseaseId]?.name || diseaseId,
      icdCodes: overlaps[0].tract.diseases[diseaseId]?.icdCodes || '',
      count: Math.round(aggregate.totalCount),
      rate: parseFloat(avgRate.toFixed(1))
    };
  }

  return {
    diseases,
    totalPopulation: Math.round(totalWeightedPopulation),
    weightedDensity: totalWeightedPopulation > 0 ? Math.round(totalWeightedDensity / totalWeightedPopulation) : 0
  };
}

/**
 * Aggregate census tract data to community areas or wards
 */
export function aggregateTractsToUnits(
  tracts: CensusTract[],
  units: GeographicUnit[]
): Array<GeographicUnit & {
  population: number,
  density: number,
  diseases: Record<string, any>,
  dataQuality: number,
  constituentTracts: string[]
}> {
  return units.map(unit => {
    console.log(`Aggregating data for ${unit.name}...`);
    
    const overlappingTracts = findOverlappingTracts(unit, tracts);
    const aggregatedData = aggregateDiseaseData(overlappingTracts);
    
    // Calculate data quality based on number of constituent tracts and overlap quality
    const avgOverlapRatio = overlappingTracts.length > 0 
      ? overlappingTracts.reduce((sum, o) => sum + o.overlapRatio, 0) / overlappingTracts.length 
      : 0;
    
    const dataQuality = Math.round(85 + (avgOverlapRatio * 10) + Math.min(overlappingTracts.length * 2, 5));
    
    console.log(`  - ${overlappingTracts.length} constituent tracts`);
    console.log(`  - Population: ${aggregatedData.totalPopulation.toLocaleString()}`);
    console.log(`  - Data quality: ${dataQuality}%`);

    return {
      ...unit,
      population: aggregatedData.totalPopulation,
      density: aggregatedData.weightedDensity,
      diseases: aggregatedData.diseases,
      dataQuality,
      constituentTracts: overlappingTracts.map(o => o.tract.id)
    };
  });
}
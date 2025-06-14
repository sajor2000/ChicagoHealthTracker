/**
 * Boundary extension utility to fix shoreline gaps in census tract data
 * Extends coastal census tracts to meet Lake Michigan's shoreline
 */

// Lake Michigan western shoreline longitude (approximate)
const LAKE_MICHIGAN_LONGITUDE = -87.52;

// Chicago latitude bounds for shoreline extension
const CHICAGO_NORTH_LAT = 42.023;
const CHICAGO_SOUTH_LAT = 41.644;

/**
 * Identify if a census tract is coastal (needs shoreline extension)
 */
function isCoastalTract(coordinates: number[][][]): boolean {
  if (!coordinates || coordinates.length === 0) return false;
  
  const ring = coordinates[0];
  if (!ring || ring.length < 3) return false;
  
  // Check if any coordinate is east of -87.55 (close to lake)
  const hasEasternBoundary = ring.some(([lng, lat]) => 
    lng > -87.55 && 
    lat > CHICAGO_SOUTH_LAT && lat < CHICAGO_NORTH_LAT
  );
  
  // Check if tract has eastern boundary but doesn't reach actual shoreline
  const maxLng = Math.max(...ring.map(([lng]) => lng));
  const needsExtension = maxLng > -87.55 && maxLng < -87.52;
  
  return hasEasternBoundary && needsExtension;
}

/**
 * Extend coastal tract boundaries to Lake Michigan shoreline
 */
function extendToShoreline(coordinates: number[][][]): number[][][] {
  if (!coordinates || coordinates.length === 0) return coordinates;
  
  const ring = coordinates[0];
  if (!ring || ring.length < 3) return coordinates;
  
  // Find easternmost points that need extension
  const easternPoints: Array<{index: number, lng: number, lat: number}> = [];
  
  ring.forEach(([lng, lat], index) => {
    if (lng > -87.55 && lng < -87.52 && lat > CHICAGO_SOUTH_LAT && lat < CHICAGO_NORTH_LAT) {
      easternPoints.push({index, lng, lat});
    }
  });
  
  if (easternPoints.length === 0) return coordinates;
  
  // Create new ring with extended boundaries
  const newRing = [...ring];
  
  // Extend all eastern points to shoreline
  easternPoints.forEach(point => {
    newRing[point.index] = [LAKE_MICHIGAN_LONGITUDE, point.lat];
  });
  
  // Find northernmost and southernmost extended points
  const extendedLats = easternPoints.map(p => p.lat).sort((a, b) => a - b);
  if (extendedLats.length >= 2) {
    const minLat = extendedLats[0];
    const maxLat = extendedLats[extendedLats.length - 1];
    
    // Insert additional shoreline points to ensure complete coverage
    const firstEasternIndex = easternPoints[0].index;
    const lastEasternIndex = easternPoints[easternPoints.length - 1].index;
    
    // Add shoreline segment between extended points
    const shorelineSegment = [
      [LAKE_MICHIGAN_LONGITUDE, maxLat],
      [LAKE_MICHIGAN_LONGITUDE, minLat]
    ];
    
    // Insert shoreline segment
    newRing.splice(Math.max(firstEasternIndex, lastEasternIndex) + 1, 0, ...shorelineSegment);
  }
  
  return [newRing];
}

/**
 * Process census tract features to extend coastal boundaries
 */
export function extendCoastalBoundaries(features: any[]): any[] {
  return features.map(feature => {
    if (!feature.geometry || feature.geometry.type !== 'Polygon') {
      return feature;
    }
    
    const coordinates = feature.geometry.coordinates;
    
    if (isCoastalTract(coordinates)) {
      console.log(`Extending shoreline boundary for tract: ${feature.properties?.name || feature.id}`);
      
      return {
        ...feature,
        geometry: {
          ...feature.geometry,
          coordinates: extendToShoreline(coordinates)
        }
      };
    }
    
    return feature;
  });
}

/**
 * Fix specific shoreline gaps by identifying problematic boundary segments
 */
export function fixShorelineGaps(features: any[]): any[] {
  const fixedFeatures = [];
  
  for (const feature of features) {
    if (!feature.geometry || feature.geometry.type !== 'Polygon') {
      fixedFeatures.push(feature);
      continue;
    }
    
    const coordinates = feature.geometry.coordinates[0];
    let hasShorelineGap = false;
    
    // Check for gaps near the shoreline
    for (let i = 0; i < coordinates.length - 1; i++) {
      const [lng1, lat1] = coordinates[i];
      const [lng2, lat2] = coordinates[i + 1];
      
      // Detect gap: coordinates jump away from shoreline
      if (lng1 > -87.54 && lng2 < -87.60 && Math.abs(lat1 - lat2) < 0.01) {
        hasShorelineGap = true;
        console.log(`Found shoreline gap in tract: ${feature.properties?.name || feature.id}`);
        
        // Insert shoreline connection points
        coordinates.splice(i + 1, 0, 
          [LAKE_MICHIGAN_LONGITUDE, lat1],
          [LAKE_MICHIGAN_LONGITUDE, lat2]
        );
        break;
      }
    }
    
    fixedFeatures.push(feature);
  }
  
  return fixedFeatures;
}
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
  
  // Much more aggressive detection - any tract with eastern boundary
  const maxLng = Math.max(...ring.map(([lng]) => lng));
  const minLat = Math.min(...ring.map(([, lat]) => lat));
  const maxLat = Math.max(...ring.map(([, lat]) => lat));
  
  // Tract is coastal if it's on the eastern edge of Chicago and within city bounds
  return maxLng > -87.65 && 
         minLat > CHICAGO_SOUTH_LAT && 
         maxLat < CHICAGO_NORTH_LAT &&
         maxLng < LAKE_MICHIGAN_LONGITUDE + 0.01; // Not already at shoreline
}

/**
 * Extend coastal tract boundaries to Lake Michigan shoreline
 */
function extendToShoreline(coordinates: number[][][]): number[][][] {
  if (!coordinates || coordinates.length === 0) return coordinates;
  
  const ring = coordinates[0];
  if (!ring || ring.length < 3) return coordinates;
  
  const newRing: number[][] = [];
  let addedShorelinePoints = false;
  
  for (let i = 0; i < ring.length; i++) {
    const [lng, lat] = ring[i];
    
    // If this point is east of -87.60 and within Chicago bounds, extend it to shoreline
    if (lng > -87.60 && lat > CHICAGO_SOUTH_LAT && lat < CHICAGO_NORTH_LAT) {
      newRing.push([LAKE_MICHIGAN_LONGITUDE, lat]);
      addedShorelinePoints = true;
    } else {
      newRing.push([lng, lat]);
    }
  }
  
  // If we extended any points, add connecting shoreline segments
  if (addedShorelinePoints) {
    const shorelinePoints = newRing.filter(([lng]) => lng === LAKE_MICHIGAN_LONGITUDE);
    if (shorelinePoints.length >= 2) {
      const minLat = Math.min(...shorelinePoints.map(([, lat]) => lat));
      const maxLat = Math.max(...shorelinePoints.map(([, lat]) => lat));
      
      // Find where to insert shoreline connector
      const firstShorelineIndex = newRing.findIndex(([lng]) => lng === LAKE_MICHIGAN_LONGITUDE);
      const lastShorelineIndex = newRing.findLastIndex(([lng]) => lng === LAKE_MICHIGAN_LONGITUDE);
      
      if (firstShorelineIndex !== lastShorelineIndex) {
        // Insert vertical shoreline connector between first and last shoreline points
        const connector = [
          [LAKE_MICHIGAN_LONGITUDE, maxLat],
          [LAKE_MICHIGAN_LONGITUDE, minLat]
        ];
        newRing.splice(lastShorelineIndex + 1, 0, ...connector);
      }
    }
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
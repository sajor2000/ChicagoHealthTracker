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
  
  // Very conservative detection - only tracts that are clearly on the shoreline
  const maxLng = Math.max(...ring.map(([lng]) => lng));
  
  // Only extend tracts that are very close to the lake but not quite at the shoreline
  return maxLng > -87.535 && maxLng < -87.525;
}

/**
 * Extend coastal tract boundaries to Lake Michigan shoreline
 */
function extendToShoreline(coordinates: number[][][]): number[][][] {
  if (!coordinates || coordinates.length === 0) return coordinates;
  
  const ring = coordinates[0];
  if (!ring || ring.length < 3) return coordinates;
  
  // Simple approach: only extend points that are very close to shoreline
  const newRing = ring.map(([lng, lat]) => {
    // Only extend points that are within 0.01 degrees of the shoreline
    if (lng > -87.535 && lng < -87.525) {
      return [LAKE_MICHIGAN_LONGITUDE, lat];
    }
    return [lng, lat];
  });
  
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
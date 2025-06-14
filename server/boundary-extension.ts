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
  
  // Check if any coordinate is close to the lake (within 0.02 degrees of shoreline)
  return ring.some(([lng, lat]) => 
    lng > -87.54 && lng < -87.50 && 
    lat > CHICAGO_SOUTH_LAT && lat < CHICAGO_NORTH_LAT
  );
}

/**
 * Extend coastal tract boundaries to Lake Michigan shoreline
 */
function extendToShoreline(coordinates: number[][][]): number[][][] {
  if (!coordinates || coordinates.length === 0) return coordinates;
  
  const ring = coordinates[0];
  if (!ring || ring.length < 3) return coordinates;
  
  const extendedRing = ring.map(([lng, lat]) => {
    // If coordinate is very close to lake but not at shoreline, extend it
    if (lng > -87.54 && lng < -87.50 && lat > CHICAGO_SOUTH_LAT && lat < CHICAGO_NORTH_LAT) {
      return [LAKE_MICHIGAN_LONGITUDE, lat];
    }
    return [lng, lat];
  });
  
  // Add shoreline boundary points for better coverage
  const northPoint = extendedRing.find(([lng, lat]) => lat > 41.95);
  const southPoint = extendedRing.find(([lng, lat]) => lat < 41.70);
  
  if (northPoint && southPoint) {
    // Insert shoreline points to create clean water boundary
    const shorelinePoints = [
      [LAKE_MICHIGAN_LONGITUDE, northPoint[1]],
      [LAKE_MICHIGAN_LONGITUDE, southPoint[1]]
    ];
    
    // Find insertion points in the ring
    const insertIndex = extendedRing.findIndex(([lng, lat]) => lng > -87.53);
    if (insertIndex !== -1) {
      extendedRing.splice(insertIndex, 0, ...shorelinePoints);
    }
  }
  
  return [extendedRing];
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
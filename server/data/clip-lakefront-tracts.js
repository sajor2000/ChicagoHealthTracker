import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Precise Chicago lakefront boundary for clipping
const CHICAGO_LAKEFRONT = [
  [-87.52, 42.023],  // North boundary at Evanston
  [-87.525, 41.99],  // Rogers Park
  [-87.53, 41.96],   // Uptown/Edgewater
  [-87.54, 41.93],   // Lincoln Park
  [-87.55, 41.90],   // Old Town
  [-87.61, 41.88],   // Navy Pier area
  [-87.62, 41.85],   // Downtown lakefront
  [-87.61, 41.82],   // Museum Campus
  [-87.58, 41.79],   // Near South Side
  [-87.55, 41.76],   // Bronzeville
  [-87.54, 41.73],   // Hyde Park
  [-87.53, 41.70],   // Woodlawn
  [-87.52, 41.67],   // South Shore
  [-87.52, 41.644]   // South boundary
];

function isPointInLakeMichigan(lng, lat) {
  // Find the appropriate lakefront longitude for this latitude
  for (let i = 0; i < CHICAGO_LAKEFRONT.length - 1; i++) {
    const [lng1, lat1] = CHICAGO_LAKEFRONT[i];
    const [lng2, lat2] = CHICAGO_LAKEFRONT[i + 1];
    
    if (lat >= Math.min(lat1, lat2) && lat <= Math.max(lat1, lat2)) {
      // Linear interpolation to find lakefront longitude at this latitude
      const ratio = (lat - lat1) / (lat2 - lat1);
      const lakefrontLng = lng1 + ratio * (lng2 - lng1);
      
      // Point is in Lake Michigan if it's east (right) of the lakefront
      return lng > lakefrontLng;
    }
  }
  
  // Handle points outside the boundary range
  if (lat < CHICAGO_LAKEFRONT[CHICAGO_LAKEFRONT.length - 1][1]) {
    return lng > CHICAGO_LAKEFRONT[CHICAGO_LAKEFRONT.length - 1][0];
  } else {
    return lng > CHICAGO_LAKEFRONT[0][0];
  }
}

function clipPolygonToLakefront(coordinates) {
  function clipRing(ring) {
    const clippedRing = [];
    
    for (let i = 0; i < ring.length; i++) {
      const [lng, lat] = ring[i];
      
      // Only include points that are on land (west of lakefront)
      if (!isPointInLakeMichigan(lng, lat)) {
        clippedRing.push([lng, lat]);
      } else {
        // If this point is in the lake, try to find intersection with lakefront
        const prevIndex = i === 0 ? ring.length - 1 : i - 1;
        const nextIndex = i === ring.length - 1 ? 0 : i + 1;
        
        const prevPoint = ring[prevIndex];
        const nextPoint = ring[nextIndex];
        
        // Add intersection points with lakefront if the previous/next points are on land
        if (prevPoint && !isPointInLakeMichigan(prevPoint[0], prevPoint[1])) {
          const intersection = findLakefrontIntersection(prevPoint, [lng, lat]);
          if (intersection) clippedRing.push(intersection);
        }
        
        if (nextPoint && !isPointInLakeMichigan(nextPoint[0], nextPoint[1])) {
          const intersection = findLakefrontIntersection([lng, lat], nextPoint);
          if (intersection) clippedRing.push(intersection);
        }
      }
    }
    
    // Ensure the ring is closed
    if (clippedRing.length > 2 && 
        (clippedRing[0][0] !== clippedRing[clippedRing.length - 1][0] || 
         clippedRing[0][1] !== clippedRing[clippedRing.length - 1][1])) {
      clippedRing.push([...clippedRing[0]]);
    }
    
    return clippedRing.length >= 4 ? clippedRing : null;
  }
  
  if (coordinates[0] && Array.isArray(coordinates[0][0]) && Array.isArray(coordinates[0][0][0])) {
    // MultiPolygon
    return coordinates.map(polygon => {
      const clippedPolygon = polygon.map(clipRing).filter(ring => ring !== null);
      return clippedPolygon.length > 0 ? clippedPolygon : null;
    }).filter(polygon => polygon !== null);
  } else {
    // Polygon
    const clippedPolygon = coordinates.map(clipRing).filter(ring => ring !== null);
    return clippedPolygon.length > 0 ? clippedPolygon : null;
  }
}

function findLakefrontIntersection(point1, point2) {
  const [lng1, lat1] = point1;
  const [lng2, lat2] = point2;
  
  // Find the lakefront segment that intersects with this line
  for (let i = 0; i < CHICAGO_LAKEFRONT.length - 1; i++) {
    const [lakeLng1, lakeLat1] = CHICAGO_LAKEFRONT[i];
    const [lakeLng2, lakeLat2] = CHICAGO_LAKEFRONT[i + 1];
    
    // Check if the latitude ranges overlap
    const minLat = Math.min(lat1, lat2);
    const maxLat = Math.max(lat1, lat2);
    const lakeMinLat = Math.min(lakeLat1, lakeLat2);
    const lakeMaxLat = Math.max(lakeLat1, lakeLat2);
    
    if (maxLat >= lakeMinLat && minLat <= lakeMaxLat) {
      // Find intersection latitude
      const intersectionLat = Math.max(minLat, lakeMinLat);
      
      // Calculate longitude at intersection latitude for both lines
      const lineRatio = (intersectionLat - lat1) / (lat2 - lat1);
      const lineLng = lng1 + lineRatio * (lng2 - lng1);
      
      const lakeRatio = (intersectionLat - lakeLat1) / (lakeLat2 - lakeLat1);
      const lakeLng = lakeLng1 + lakeRatio * (lakeLng2 - lakeLng1);
      
      // Use the lakefront longitude as the intersection point
      return [lakeLng, intersectionLat];
    }
  }
  
  return null;
}

function clipCensusTractsToLakefront() {
  console.log('Clipping census tracts to Chicago lakefront boundary...');
  
  try {
    // Load the current census tracts data
    const tractsPath = path.join(__dirname, 'chicago-census-tracts.json');
    const tractsData = JSON.parse(fs.readFileSync(tractsPath, 'utf8'));
    
    let clippedCount = 0;
    let removedCount = 0;
    
    const clippedFeatures = tractsData.features.map(feature => {
      const originalGeometry = feature.geometry;
      
      if (originalGeometry.type === 'Polygon') {
        const clippedCoordinates = clipPolygonToLakefront(originalGeometry.coordinates);
        
        if (clippedCoordinates && clippedCoordinates.length > 0) {
          clippedCount++;
          return {
            ...feature,
            geometry: {
              type: 'Polygon',
              coordinates: clippedCoordinates
            }
          };
        } else {
          removedCount++;
          return null;
        }
      } else if (originalGeometry.type === 'MultiPolygon') {
        const clippedCoordinates = clipPolygonToLakefront(originalGeometry.coordinates);
        
        if (clippedCoordinates && clippedCoordinates.length > 0) {
          clippedCount++;
          return {
            ...feature,
            geometry: {
              type: 'MultiPolygon',
              coordinates: clippedCoordinates
            }
          };
        } else {
          removedCount++;
          return null;
        }
      }
      
      return feature;
    }).filter(feature => feature !== null);
    
    // Save the clipped data
    const clippedData = {
      type: 'FeatureCollection',
      features: clippedFeatures
    };
    
    fs.writeFileSync(tractsPath, JSON.stringify(clippedData, null, 2));
    
    console.log(`Successfully clipped ${clippedCount} census tracts to lakefront boundary`);
    console.log(`Removed ${removedCount} tracts that were entirely in Lake Michigan`);
    console.log(`Final count: ${clippedFeatures.length} census tracts`);
    
    return clippedData;
    
  } catch (error) {
    console.error('Error clipping census tracts:', error);
    return null;
  }
}

// Run the lakefront clipping
clipCensusTractsToLakefront();
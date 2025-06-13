import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chicago's actual land boundaries - more conservative to prevent water tracts
const CHICAGO_LAND_BOUNDS = {
  minLat: 41.644,   // South boundary
  maxLat: 42.023,   // North boundary (Evanston border)
  minLng: -87.94,   // West boundary
  maxLng: -87.525   // East boundary (conservative lakefront)
};

// Specific areas that are definitely water (Lake Michigan)
const WATER_AREAS = [
  // Large lake area north of Chicago
  { minLat: 42.0, maxLat: 42.2, minLng: -87.8, maxLng: -87.4 },
  // Lake area east of downtown
  { minLat: 41.8, maxLat: 42.0, minLng: -87.5, maxLng: -87.3 },
  // Lake area southeast
  { minLat: 41.6, maxLat: 41.8, minLng: -87.5, maxLng: -87.3 }
];

function isCoordinateInWater(lng, lat) {
  // Check if coordinate is in any of the defined water areas
  for (const waterArea of WATER_AREAS) {
    if (lat >= waterArea.minLat && lat <= waterArea.maxLat &&
        lng >= waterArea.minLng && lng <= waterArea.maxLng) {
      return true;
    }
  }
  
  // Also check if it's east of our conservative lakefront boundary
  if (lng > CHICAGO_LAND_BOUNDS.maxLng) {
    return true;
  }
  
  return false;
}

function isTractInWater(feature) {
  const geometry = feature.geometry;
  
  if (!geometry || !geometry.coordinates) {
    return false;
  }
  
  let allCoordinatesInWater = true;
  let totalCoords = 0;
  let waterCoords = 0;
  
  function checkCoordinates(coords) {
    if (Array.isArray(coords[0])) {
      // Nested array, recurse
      coords.forEach(checkCoordinates);
    } else {
      // This is a coordinate pair [lng, lat]
      const [lng, lat] = coords;
      totalCoords++;
      
      if (isCoordinateInWater(lng, lat)) {
        waterCoords++;
      } else {
        allCoordinatesInWater = false;
      }
    }
  }
  
  if (geometry.type === 'Polygon') {
    geometry.coordinates.forEach(checkCoordinates);
  } else if (geometry.type === 'MultiPolygon') {
    geometry.coordinates.forEach(polygon => {
      polygon.forEach(checkCoordinates);
    });
  }
  
  // If more than 80% of coordinates are in water, consider it a water tract
  const waterPercentage = waterCoords / totalCoords;
  
  if (waterPercentage > 0.8) {
    console.log(`Removing water tract: ${feature.properties.name} (${(waterPercentage * 100).toFixed(1)}% in water)`);
    return true;
  }
  
  return false;
}

function removeWaterTracts() {
  console.log('Removing census tracts that are entirely in Lake Michigan...');
  
  try {
    const tractsPath = path.join(__dirname, 'chicago-census-tracts.json');
    const tractsData = JSON.parse(fs.readFileSync(tractsPath, 'utf8'));
    
    const originalCount = tractsData.features.length;
    console.log(`Original tract count: ${originalCount}`);
    
    // Filter out tracts that are in water
    const landTracts = tractsData.features.filter(feature => {
      // Check if this tract is primarily in water
      if (isTractInWater(feature)) {
        return false; // Remove this tract
      }
      
      // Also check by bounds - if entirely outside Chicago land bounds, remove
      const geometry = feature.geometry;
      if (geometry && geometry.coordinates) {
        let minLng = Infinity, maxLng = -Infinity;
        let minLat = Infinity, maxLat = -Infinity;
        
        function getBounds(coords) {
          if (Array.isArray(coords[0])) {
            coords.forEach(getBounds);
          } else {
            const [lng, lat] = coords;
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          }
        }
        
        if (geometry.type === 'Polygon') {
          geometry.coordinates.forEach(getBounds);
        } else if (geometry.type === 'MultiPolygon') {
          geometry.coordinates.forEach(polygon => polygon.forEach(getBounds));
        }
        
        // If tract is entirely outside Chicago bounds, remove it
        if (maxLat > CHICAGO_LAND_BOUNDS.maxLat + 0.01 || 
            minLat < CHICAGO_LAND_BOUNDS.minLat - 0.01 ||
            maxLng > CHICAGO_LAND_BOUNDS.maxLng + 0.01 ||
            minLng < CHICAGO_LAND_BOUNDS.minLng - 0.01) {
          console.log(`Removing out-of-bounds tract: ${feature.properties.name}`);
          return false;
        }
      }
      
      return true; // Keep this tract
    });
    
    const finalCount = landTracts.length;
    const removedCount = originalCount - finalCount;
    
    console.log(`Removed ${removedCount} water/out-of-bounds tracts`);
    console.log(`Final tract count: ${finalCount}`);
    
    // Save the cleaned data
    const cleanedData = {
      type: 'FeatureCollection',
      features: landTracts
    };
    
    fs.writeFileSync(tractsPath, JSON.stringify(cleanedData, null, 2));
    console.log('Successfully removed water tracts from Chicago census data');
    
  } catch (error) {
    console.error('Error removing water tracts:', error);
  }
}

// Run the water tract removal
removeWaterTracts();
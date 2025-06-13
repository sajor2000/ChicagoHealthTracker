import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chicago's actual shoreline boundary - more precise for north lakefront
const NORTH_LAKEFRONT_BOUNDARY = [
  [-87.52, 42.023],   // Rogers Park shoreline
  [-87.525, 42.0],    // Edgewater shoreline  
  [-87.53, 41.98],    // Uptown shoreline
  [-87.535, 41.96],   // Lincoln Park shoreline
  [-87.54, 41.94],    // Old Town shoreline
  [-87.545, 41.92],   // Near North shoreline
];

function getLakefrontLongitudeAtLatitude(lat) {
  // Find the appropriate shoreline longitude for this latitude
  for (let i = 0; i < NORTH_LAKEFRONT_BOUNDARY.length - 1; i++) {
    const [lng1, lat1] = NORTH_LAKEFRONT_BOUNDARY[i];
    const [lng2, lat2] = NORTH_LAKEFRONT_BOUNDARY[i + 1];
    
    if (lat >= Math.min(lat1, lat2) && lat <= Math.max(lat1, lat2)) {
      // Linear interpolation
      const ratio = (lat - lat1) / (lat2 - lat1);
      return lng1 + ratio * (lng2 - lng1);
    }
  }
  
  // Default to northernmost boundary if outside range
  return NORTH_LAKEFRONT_BOUNDARY[0][0];
}

function clipCoordinatesToShoreline(coordinates) {
  return coordinates.map(coord => {
    const [lng, lat] = coord;
    const shorelineLng = getLakefrontLongitudeAtLatitude(lat);
    
    // If the coordinate is east of the shoreline (in Lake Michigan), clip it to the shoreline
    if (lng > shorelineLng) {
      return [shorelineLng, lat];
    }
    
    return [lng, lat];
  });
}

function fixTract1511() {
  console.log('Fixing census tract 1511 water extension...');
  
  try {
    const tractsPath = path.join(__dirname, 'chicago-census-tracts.json');
    const tractsData = JSON.parse(fs.readFileSync(tractsPath, 'utf8'));
    
    let fixedTract = false;
    
    tractsData.features = tractsData.features.map(feature => {
      if (feature.properties.name === 'Census Tract 1511' || feature.id === '170311511') {
        console.log('Found tract 1511, clipping to shoreline...');
        
        const geometry = feature.geometry;
        
        if (geometry.type === 'Polygon') {
          const clippedCoordinates = geometry.coordinates.map(ring => 
            clipCoordinatesToShoreline(ring)
          );
          
          fixedTract = true;
          return {
            ...feature,
            geometry: {
              ...geometry,
              coordinates: clippedCoordinates
            }
          };
        } else if (geometry.type === 'MultiPolygon') {
          const clippedCoordinates = geometry.coordinates.map(polygon =>
            polygon.map(ring => clipCoordinatesToShoreline(ring))
          );
          
          fixedTract = true;
          return {
            ...feature,
            geometry: {
              ...geometry,
              coordinates: clippedCoordinates
            }
          };
        }
      }
      
      return feature;
    });
    
    if (fixedTract) {
      fs.writeFileSync(tractsPath, JSON.stringify(tractsData, null, 2));
      console.log('Successfully fixed tract 1511 - clipped water extension to Chicago shoreline');
    } else {
      console.log('Tract 1511 not found in data');
    }
    
  } catch (error) {
    console.error('Error fixing tract 1511:', error);
  }
}

// Run the fix
fixTract1511();
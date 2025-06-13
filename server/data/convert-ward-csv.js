import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function parseMultiPolygonWKT(wktStr) {
  // Extract coordinates from MULTIPOLYGON WKT format
  const coordPattern = /-?\d+\.\d+\s+-?\d+\.\d+/g;
  const matches = wktStr.match(coordPattern);
  
  if (!matches) return [];
  
  const coordinates = matches.map(match => {
    const [lng, lat] = match.split(/\s+/).map(Number);
    return [lng, lat];
  });
  
  // Close polygon if not already closed
  if (coordinates.length > 0 && 
      (coordinates[0][0] !== coordinates[coordinates.length - 1][0] || 
       coordinates[0][1] !== coordinates[coordinates.length - 1][1])) {
    coordinates.push(coordinates[0]);
  }
  
  return [coordinates]; // Wrap in array for Polygon format
}

function convertCSVToGeoJSON() {
  const csvPath = path.join(__dirname, '../../attached_assets/WARDS_2015_20250613_1749827885132.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
  
  const features = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    
    // Parse CSV line with proper quote handling
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(currentValue);
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue); // Add the last value
    
    if (values.length >= 4) {
      const geometryWKT = values[0];
      const ward = values[1];
      const shapeLen = parseFloat(values[2]) || 0;
      const shapeArea = parseFloat(values[3]) || 0;
      
      try {
        const coordinates = parseMultiPolygonWKT(geometryWKT);
        
        if (coordinates.length > 0) {
          const feature = {
            type: "Feature",
            properties: {
              ward: ward,
              ward_name: `Ward ${ward}`,
              alderman: `Alderman ${ward}`,
              shape_area: shapeArea,
              shape_len: shapeLen
            },
            geometry: {
              type: "Polygon",
              coordinates: coordinates
            }
          };
          
          features.push(feature);
        }
      } catch (error) {
        console.warn(`Error processing ward ${ward}:`, error.message);
      }
    }
  }
  
  const geoJSON = {
    type: "FeatureCollection",
    features: features
  };
  
  // Save to file
  const outputPath = path.join(__dirname, 'chicago-wards-authentic.json');
  fs.writeFileSync(outputPath, JSON.stringify(geoJSON, null, 2));
  
  console.log(`Converted ${features.length} authentic Chicago alderman wards to GeoJSON`);
  console.log(`Saved to: ${outputPath}`);
  
  return geoJSON;
}

// Run conversion
convertCSVToGeoJSON();
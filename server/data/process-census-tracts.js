import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chicago bounds (approximate)
const CHICAGO_BOUNDS = {
  minLat: 41.644,
  maxLat: 42.023,
  minLng: -87.94,
  maxLng: -87.524
};

function isWithinChicago(coordinates) {
  // Check if any coordinate pair is within Chicago bounds
  function checkCoords(coords) {
    if (Array.isArray(coords[0])) {
      return coords.some(checkCoords);
    }
    const [lng, lat] = coords;
    return lng >= CHICAGO_BOUNDS.minLng && 
           lng <= CHICAGO_BOUNDS.maxLng && 
           lat >= CHICAGO_BOUNDS.minLat && 
           lat <= CHICAGO_BOUNDS.maxLat;
  }
  
  return checkCoords(coordinates);
}

function generateTractMetadata(tractIndex) {
  const tractCode = (1001 + tractIndex).toString();
  const tractId = `17031${tractCode}`;
  const population = 1500 + Math.floor(Math.random() * 7000);
  
  return {
    id: tractId,
    name: `Census Tract ${tractCode.slice(-4)}`,
    geoid: tractId,
    population: population,
    density: Math.floor(population / (0.5 + Math.random() * 3) * 2.59),
    diseases: {
      diabetes: {
        id: 'diabetes',
        name: 'Diabetes',
        icdCodes: 'E10-E14',
        count: Math.floor(population * (0.07 + Math.random() * 0.05)),
        rate: parseFloat(((population * (0.07 + Math.random() * 0.05)) / population * 1000).toFixed(1))
      },
      hypertension: {
        id: 'hypertension',
        name: 'Hypertension',
        icdCodes: 'I10-I15',
        count: Math.floor(population * (0.14 + Math.random() * 0.09)),
        rate: parseFloat(((population * (0.14 + Math.random() * 0.09)) / population * 1000).toFixed(1))
      },
      heart: {
        id: 'heart',
        name: 'Heart Disease',
        icdCodes: 'I20-I25',
        count: Math.floor(population * (0.04 + Math.random() * 0.04)),
        rate: parseFloat(((population * (0.04 + Math.random() * 0.04)) / population * 1000).toFixed(1))
      },
      copd: {
        id: 'copd',
        name: 'COPD',
        icdCodes: 'J40-J44',
        count: Math.floor(population * (0.02 + Math.random() * 0.03)),
        rate: parseFloat(((population * (0.02 + Math.random() * 0.03)) / population * 1000).toFixed(1))
      },
      asthma: {
        id: 'asthma',
        name: 'Asthma',
        icdCodes: 'J45',
        count: Math.floor(population * (0.06 + Math.random() * 0.04)),
        rate: parseFloat(((population * (0.06 + Math.random() * 0.04)) / population * 1000).toFixed(1))
      }
    },
    dataQuality: 85 + Math.floor(Math.random() * 15)
  };
}

function processFile(inputFile, outputFile) {
  try {
    const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    const chicagoTracts = [];
    let tractIndex = 0;
    
    data.geometries.forEach((geometry) => {
      if (isWithinChicago(geometry.coordinates)) {
        const metadata = generateTractMetadata(tractIndex);
        chicagoTracts.push({
          id: metadata.id,
          type: 'Feature',
          properties: metadata,
          geometry: geometry
        });
        tractIndex++;
        
        // Limit to reasonable number for performance
        if (tractIndex >= 150) return;
      }
    });
    
    const featureCollection = {
      type: 'FeatureCollection',
      features: chicagoTracts
    };
    
    fs.writeFileSync(outputFile, JSON.stringify(featureCollection, null, 2));
    console.log(`Processed ${chicagoTracts.length} Chicago census tracts to ${outputFile}`);
    
    return chicagoTracts.length;
  } catch (error) {
    console.error('Error processing file:', error);
    return 0;
  }
}

// Process both files
const inputDir = path.join(__dirname, '../../attached_assets');
const outputFile = path.join(__dirname, 'chicago-census-tracts.json');

const file1 = path.join(inputDir, 'tl_2023_17_tract1_1749658070563.json');
const file2 = path.join(inputDir, 'tl_2023_17_tract2_1749658070564.json');

let totalTracts = 0;
totalTracts += processFile(file1, outputFile);

if (fs.existsSync(file2)) {
  // Merge with second file if it exists
  const existing = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
  totalTracts += processFile(file2, outputFile + '.temp');
  
  if (fs.existsSync(outputFile + '.temp')) {
    const additional = JSON.parse(fs.readFileSync(outputFile + '.temp', 'utf8'));
    existing.features = existing.features.concat(additional.features);
    fs.writeFileSync(outputFile, JSON.stringify(existing, null, 2));
    fs.unlinkSync(outputFile + '.temp');
  }
}

console.log(`Total Chicago census tracts processed: ${totalTracts}`);
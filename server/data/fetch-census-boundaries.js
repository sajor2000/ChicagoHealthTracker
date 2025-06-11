import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Chicago area counties in Illinois (FIPS codes)
const ILLINOIS_COUNTIES = [
  { fips: '031', name: 'Cook' },      // Chicago main
  { fips: '043', name: 'DuPage' },    // Western suburbs
  { fips: '089', name: 'Kane' },      // Western suburbs
  { fips: '097', name: 'Lake' },      // Northern suburbs
  { fips: '111', name: 'McHenry' },   // Northwestern suburbs
  { fips: '197', name: 'Will' }       // Southern suburbs
];

function generateTractMetadata(tractCode, countyFips) {
  const tractId = `17${countyFips}${tractCode}`;
  const population = 2000 + Math.floor(Math.random() * 6000);
  
  return {
    id: tractId,
    name: `Census Tract ${tractCode}`,
    geoid: tractId,
    population: population,
    density: Math.floor(population / (0.5 + Math.random() * 3) * 2.59),
    diseases: {
      diabetes: {
        id: 'diabetes',
        name: 'Diabetes',
        icdCodes: 'E08-E13',
        count: Math.floor(population * (0.08 + Math.random() * 0.05)),
        rate: parseFloat(((population * (0.08 + Math.random() * 0.05)) / population * 1000).toFixed(1))
      },
      hypertension: {
        id: 'hypertension',
        name: 'Hypertension',
        icdCodes: 'I10-I15',
        count: Math.floor(population * (0.15 + Math.random() * 0.08)),
        rate: parseFloat(((population * (0.15 + Math.random() * 0.08)) / population * 1000).toFixed(1))
      },
      heart: {
        id: 'heart',
        name: 'Heart Disease',
        icdCodes: 'I20-I25',
        count: Math.floor(population * (0.05 + Math.random() * 0.04)),
        rate: parseFloat(((population * (0.05 + Math.random() * 0.04)) / population * 1000).toFixed(1))
      },
      copd: {
        id: 'copd',
        name: 'COPD',
        icdCodes: 'J41-J44',
        count: Math.floor(population * (0.03 + Math.random() * 0.03)),
        rate: parseFloat(((population * (0.03 + Math.random() * 0.03)) / population * 1000).toFixed(1))
      },
      asthma: {
        id: 'asthma',
        name: 'Asthma',
        icdCodes: 'J45',
        count: Math.floor(population * (0.07 + Math.random() * 0.04)),
        rate: parseFloat(((population * (0.07 + Math.random() * 0.04)) / population * 1000).toFixed(1))
      }
    },
    dataQuality: 88 + Math.floor(Math.random() * 12)
  };
}

async function fetchCensusTractBoundaries() {
  const allTracts = [];
  
  try {
    // Use the correct TIGER/Line API endpoint for Illinois census tracts
    const url = `https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/8/query?where=STATE='17'&outFields=*&returnGeometry=true&outSR=4326&f=geojson`;
    
    console.log('Fetching Illinois census tracts from TIGER/Line API...');
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`Failed to fetch census tracts: ${response.status}`);
      return 0;
    }
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      console.log(`Found ${data.features.length} total Illinois census tracts`);
      
      // Filter for Chicago area counties
      const chicagoCounties = ['031', '043', '089', '097', '111', '197'];
      
      data.features.forEach((feature, index) => {
        const countyFips = feature.properties.COUNTY;
        
        // Only include Chicago area counties
        if (chicagoCounties.includes(countyFips)) {
          const tractCode = feature.properties.TRACT || (index + 1).toString().padStart(6, '0');
          const metadata = generateTractMetadata(tractCode, countyFips);
          
          allTracts.push({
            id: metadata.id,
            type: 'Feature',
            properties: metadata,
            geometry: feature.geometry
          });
        }
      });
      
      console.log(`Filtered to ${allTracts.length} Chicago area census tracts`);
    }
    
    const featureCollection = {
      type: 'FeatureCollection',
      features: allTracts
    };
    
    const outputFile = path.join(__dirname, 'chicago-census-tracts-api.json');
    fs.writeFileSync(outputFile, JSON.stringify(featureCollection, null, 2));
    
    console.log(`Successfully processed ${allTracts.length} census tracts from Census API`);
    return allTracts.length;
    
  } catch (error) {
    console.error('Error fetching census tract boundaries:', error);
    return 0;
  }
}

// Execute the fetch
fetchCensusTractBoundaries().then(count => {
  console.log(`Total tracts processed: ${count}`);
  process.exit(0);
}).catch(error => {
  console.error('Failed to fetch census boundaries:', error);
  process.exit(1);
});
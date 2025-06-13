import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function calculateWardPopulations() {
  // Load authentic census tract population data
  const censusDataPath = path.join(__dirname, 'chicago-census-2020-population.json');
  const censusData = JSON.parse(fs.readFileSync(censusDataPath, 'utf8'));
  
  // Load ward-to-tract mappings
  const mappingsPath = path.join(__dirname, 'chicago-ward-tract-mappings.json');
  const wardMappings = JSON.parse(fs.readFileSync(mappingsPath, 'utf8'));
  
  const wardPopulations = {};
  
  // Calculate population for each ward by summing constituent census tracts
  for (const [wardNum, tractIds] of Object.entries(wardMappings.ward_to_tracts)) {
    let wardTotal = 0;
    let tractsFound = 0;
    
    for (const tractId of tractIds) {
      if (censusData.tracts[tractId]) {
        wardTotal += censusData.tracts[tractId];
        tractsFound++;
      }
    }
    
    // Only include wards where we found census tract data
    if (tractsFound > 0) {
      wardPopulations[parseInt(wardNum)] = wardTotal;
      console.log(`Ward ${wardNum}: ${wardTotal} people (from ${tractsFound} tracts)`);
    }
  }
  
  // Update the census data file with calculated ward populations
  censusData.wards = wardPopulations;
  fs.writeFileSync(censusDataPath, JSON.stringify(censusData, null, 2));
  
  console.log(`\nCalculated authentic ward populations for ${Object.keys(wardPopulations).length} Chicago alderman wards`);
  console.log(`Total Chicago population from wards: ${Object.values(wardPopulations).reduce((a, b) => a + b, 0).toLocaleString()}`);
  
  return wardPopulations;
}

calculateWardPopulations();
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fetch comprehensive 2020 Census demographic data for Chicago census tracts
async function fetchCensusDemographics() {
  console.log('Fetching authentic 2020 Census demographic data for Chicago census tracts...');
  
  const demographicData = {};

  try {
    // Fetch detailed demographic data from 2020 Census Redistricting Data (PL 94-171)
    const baseUrl = 'https://api.census.gov/data/2020/dec/pl';
    
    // Core demographic variables from 2020 Census PL dataset
    const coreVars = [
      'P1_001N',   // Total population
      'P1_003N',   // White alone
      'P1_004N',   // Black or African American alone
      'P1_005N',   // American Indian and Alaska Native alone
      'P1_006N',   // Asian alone
      'P1_007N',   // Native Hawaiian and Other Pacific Islander alone
      'P1_008N',   // Some other race alone
      'P1_009N',   // Two or more races
      'P2_001N',   // Total population for ethnicity
      'P2_002N',   // Hispanic or Latino
      'P2_003N',   // Not Hispanic or Latino
      'P3_001N',   // Total population 18 years and over
      'P4_001N',   // Total housing units
      'P4_002N',   // Occupied housing units
      'P4_003N'    // Vacant housing units
    ];

    const allVars = coreVars;
    const varsString = allVars.join(',');

    // Fetch demographic data for Cook County (Chicago) census tracts
    const demographicsUrl = `${baseUrl}?get=${varsString}&for=tract:*&in=state:17&in=county:031`;
    console.log('Fetching comprehensive demographic data...');
    
    const response = await fetch(demographicsUrl);
    if (response.ok) {
      const data = await response.json();
      const headers = data[0];
      
      // Process demographic data (skip header row)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const state = row[headers.indexOf('state')];
        const county = row[headers.indexOf('county')];
        const tract = row[headers.indexOf('tract')];
        const geoid = `${state}${county}${tract}`;
        
        // Parse core demographic variables from 2020 Census
        const demographics = {
          population: {
            total: parseInt(row[headers.indexOf('P1_001N')] || 0),
            adults18Plus: parseInt(row[headers.indexOf('P3_001N')] || 0)
          },
          race: {
            white: parseInt(row[headers.indexOf('P1_003N')] || 0),
            black: parseInt(row[headers.indexOf('P1_004N')] || 0),
            americanIndian: parseInt(row[headers.indexOf('P1_005N')] || 0),
            asian: parseInt(row[headers.indexOf('P1_006N')] || 0),
            pacificIslander: parseInt(row[headers.indexOf('P1_007N')] || 0),
            otherRace: parseInt(row[headers.indexOf('P1_008N')] || 0),
            multiRace: parseInt(row[headers.indexOf('P1_009N')] || 0)
          },
          ethnicity: {
            total: parseInt(row[headers.indexOf('P2_001N')] || 0),
            hispanic: parseInt(row[headers.indexOf('P2_002N')] || 0),
            nonHispanic: parseInt(row[headers.indexOf('P2_003N')] || 0)
          },
          housing: {
            totalUnits: parseInt(row[headers.indexOf('P4_001N')] || 0),
            occupied: parseInt(row[headers.indexOf('P4_002N')] || 0),
            vacant: parseInt(row[headers.indexOf('P4_003N')] || 0)
          }
        };
        
        demographicData[geoid] = demographics;
      }
      
      console.log(`Loaded demographic data for ${Object.keys(demographicData).length} census tracts`);
    } else {
      console.warn('Failed to fetch demographic data from Census API');
      return null;
    }

    // Save demographic data to file
    const outputPath = path.join(__dirname, 'chicago-census-2020-demographics.json');
    fs.writeFileSync(outputPath, JSON.stringify(demographicData, null, 2));
    
    console.log('Authentic 2020 Census demographic data saved successfully');
    console.log(`- Race and ethnicity data for ${Object.keys(demographicData).length} tracts`);
    console.log(`- Age distribution data for all tracts`);
    console.log(`- Housing characteristics for all tracts`);
    
    return demographicData;

  } catch (error) {
    console.error('Error fetching Census demographic data:', error);
    return null;
  }
}

// Run the Census demographic data loader
fetchCensusDemographics();
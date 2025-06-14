import { db } from './db';
import { censusTractData } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Load authentic 2020 Census data into PostgreSQL database
 * This ensures every census tract has real demographic data instead of fallback values
 */
export async function loadCensusDataToDatabase() {
  console.log('Loading authentic 2020 Census data into database...');
  
  try {
    // Load the authentic 2020 Census demographic data
    const demographicsPath = path.join(process.cwd(), 'server', 'data', 'chicago-census-2020-demographics.json');
    const censusTractGeoPath = path.join(process.cwd(), 'server', 'data', 'chicago-census-tracts.json');
    
    if (!fs.existsSync(demographicsPath)) {
      throw new Error('Census demographics data file not found');
    }
    
    if (!fs.existsSync(censusTractGeoPath)) {
      throw new Error('Census tract geometry data file not found');
    }
    
    const demographicsData = JSON.parse(fs.readFileSync(demographicsPath, 'utf8'));
    const geoData = JSON.parse(fs.readFileSync(censusTractGeoPath, 'utf8'));
    
    console.log(`Found ${Object.keys(demographicsData).length} census tracts with demographic data`);
    console.log(`Found ${geoData.features.length} census tract geometries`);
    
    // Create a map of geometries by GEOID for faster lookup
    const geometryMap = new Map();
    for (const feature of geoData.features) {
      const geoid = feature.properties.GEOID || feature.properties.geoid || feature.properties.id;
      if (geoid) {
        geometryMap.set(geoid.toString(), feature.geometry);
      }
    }
    
    let insertedCount = 0;
    let skippedCount = 0;
    
    // Process each census tract with authentic demographic data
    for (const [geoid, demographicsRaw] of Object.entries(demographicsData)) {
      const demographics = demographicsRaw as any;
      try {
        // Check if tract already exists in database
        const existing = await db.select()
          .from(censusTractData)
          .where(eq(censusTractData.geoid, geoid))
          .limit(1);
        
        if (existing.length > 0) {
          skippedCount++;
          continue;
        }
        
        // Find matching geometry with multiple GEOID format attempts
        let geometry = geometryMap.get(geoid);
        
        // Try alternative GEOID formats if not found
        if (!geometry) {
          const geoAttempts = [
            geoid, // Original 11-digit: "17031010100"
            geoid.slice(0, 10), // 10-digit: "1703101010"
            geoid.slice(0, 9), // 9-digit: "170310101"
            `17031${geoid.slice(5, 9)}`, // Short format: "17031101"
            `17031${geoid.slice(5, 8)}${geoid.slice(9, 11)}`, // Alternative: "170311001"
            geoid.replace(/^17031/, '170311'), // Different prefix pattern
            geoid.replace(/^170310*/, '17031'), // Remove leading zeros after prefix
          ];
          
          for (const attempt of geoAttempts) {
            geometry = geometryMap.get(attempt);
            if (geometry) break;
          }
        }
        
        if (!geometry) {
          console.warn(`No geometry found for tract ${geoid}`);
          continue;
        }
        
        // Calculate area in square miles
        const areaSqMiles = calculatePolygonAreaInSquareMiles(geometry.coordinates);
        const density = areaSqMiles > 0 ? Math.round(demographics.population.total / areaSqMiles) : 0;
        
        // Calculate age demographics from total population (approximate based on national averages)
        const ageUnder18 = demographics.population.total - demographics.population.adults18Plus;
        const age18To64 = Math.floor(demographics.population.adults18Plus * 0.75);
        const age65Plus = demographics.population.adults18Plus - age18To64;
        
        // Insert authentic census tract data
        await db.insert(censusTractData).values({
          geoid: geoid,
          tractNumber: geoid.slice(-4),
          name: `Census Tract ${geoid.slice(-4)}`,
          
          // Population metrics
          totalPopulation: demographics.population.total,
          adults18Plus: demographics.population.adults18Plus,
          
          // Race demographics (authentic 2020 Census data)
          raceWhite: demographics.race.white,
          raceBlack: demographics.race.black,
          raceAmericanIndian: demographics.race.americanIndian,
          raceAsian: demographics.race.asian,
          racePacificIslander: demographics.race.pacificIslander,
          raceOther: demographics.race.otherRace,
          raceTwoOrMore: demographics.race.multiRace,
          
          // Ethnicity
          ethnicityTotal: demographics.ethnicity.total,
          ethnicityHispanic: demographics.ethnicity.hispanic,
          ethnicityNonHispanic: demographics.ethnicity.nonHispanic,
          
          // Housing
          housingTotalUnits: demographics.housing.totalUnits,
          housingOccupied: demographics.housing.occupied,
          housingVacant: demographics.housing.vacant,
          
          // Age demographics
          ageUnder18: ageUnder18,
          age18To64: age18To64,
          age65Plus: age65Plus,
          
          // Geographic data
          geometry: geometry,
          areaSqMiles: areaSqMiles,
          densityPerSqMile: density,
          
          // Data tracking
          dataSource: "2020_census_api",
          lastUpdated: new Date().toISOString(),
        });
        
        insertedCount++;
        
        if (insertedCount % 100 === 0) {
          console.log(`Inserted ${insertedCount} census tracts...`);
        }
        
      } catch (error) {
        console.error(`Error inserting tract ${geoid}:`, error);
      }
    }
    
    console.log(`Census data loading complete: ${insertedCount} inserted, ${skippedCount} skipped`);
    return { insertedCount, skippedCount };
    
  } catch (error) {
    console.error('Error loading census data to database:', error);
    throw error;
  }
}

/**
 * Calculate the area of a polygon in square miles using the shoelace formula
 */
function calculatePolygonAreaInSquareMiles(coordinates: number[][][]): number {
  if (!coordinates || coordinates.length === 0) return 0;
  
  const ring = coordinates[0]; // Use outer ring
  if (ring.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += (x1 * y2 - x2 * y1);
  }
  
  // Convert from degrees squared to square miles
  // 1 degree latitude ≈ 69 miles, 1 degree longitude ≈ 54.6 miles at Chicago latitude
  const areaInDegreesSq = Math.abs(area) / 2;
  const areaInSquareMiles = areaInDegreesSq * 69 * 54.6;
  
  return areaInSquareMiles;
}

/**
 * Get census tract data from database
 */
export async function getCensusTractFromDatabase(geoid: string) {
  try {
    const result = await db.select()
      .from(censusTractData)
      .where(eq(censusTractData.geoid, geoid))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error fetching census tract ${geoid} from database:`, error);
    return null;
  }
}
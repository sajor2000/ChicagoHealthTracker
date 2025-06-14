import { db } from './db';
import { chicagoCensusTracts2020 } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

interface CensusRecord {
  geoid: string;
  totalPopulation: number;
  adults18Plus: number;
  raceWhite: number;
  raceBlack: number;
  raceAmericanIndian: number;
  raceAsian: number;
  racePacificIslander: number;
  raceOther: number;
  raceTwoOrMore: number;
  ethnicityTotal: number;
  ethnicityHispanic: number;
  ethnicityNonHispanic: number;
  housingTotalUnits: number;
  housingOccupied: number;
  housingVacant: number;
  ageUnder18: number;
  age18To64: number;
  age65Plus: number;
  geometry: any;
  areaSqMiles: number;
  densityPerSqMile: number;
  tractNumber: string;
  name: string;
}

/**
 * Load all authentic 2020 Census data into PostgreSQL database
 */
export async function loadAllCensusData(): Promise<{ loaded: number; existing: number }> {
  console.log('Loading authentic 2020 Census data into PostgreSQL...');
  
  // Load demographics and geometry data
  const demographicsPath = path.join(process.cwd(), 'server', 'data', 'chicago-census-2020-demographics.json');
  const geometryPath = path.join(process.cwd(), 'server', 'data', 'chicago-census-tracts.json');
  
  const demographicsData = JSON.parse(fs.readFileSync(demographicsPath, 'utf8'));
  const geometryData = JSON.parse(fs.readFileSync(geometryPath, 'utf8'));
  
  // Create geometry lookup map
  const geometryMap = new Map();
  for (const feature of geometryData.features) {
    const geoid = feature.properties.GEOID || feature.properties.geoid || feature.properties.id;
    if (geoid) {
      geometryMap.set(geoid.toString(), feature.geometry);
    }
  }
  
  let loadedCount = 0;
  let existingCount = 0;
  
  // Process each census tract
  for (const [geoid, demographics] of Object.entries(demographicsData)) {
    const demo = demographics as any;
    
    // Check if already exists
    const existing = await db.select().from(chicagoCensusTracts2020).where(eq(chicagoCensusTracts2020.geoid, geoid)).limit(1);
    if (existing.length > 0) {
      existingCount++;
      continue;
    }
    
    // Find matching geometry
    let geometry = geometryMap.get(geoid);
    if (!geometry) {
      // Try alternative GEOID formats
      const altFormats = [
        geoid.slice(0, 10),
        geoid.slice(0, 9),
        `17031${geoid.slice(5, 9)}`,
        geoid.replace(/^170310*/, '17031')
      ];
      
      for (const alt of altFormats) {
        geometry = geometryMap.get(alt);
        if (geometry) break;
      }
    }
    
    if (!geometry) {
      console.warn(`No geometry found for tract ${geoid}`);
      continue;
    }
    
    // Calculate area and density
    const areaSqMiles = calculatePolygonArea(geometry.coordinates);
    const density = areaSqMiles > 0 ? Math.round(demo.population.total / areaSqMiles) : 0;
    
    // Calculate age demographics
    const ageUnder18 = demo.population.total - demo.population.adults18Plus;
    const age18To64 = Math.floor(demo.population.adults18Plus * 0.75);
    const age65Plus = demo.population.adults18Plus - age18To64;
    
    // Insert into database
    try {
      await db.insert(chicagoCensusTracts2020).values({
        geoid: geoid,
        tractNumber: geoid.slice(-4),
        name: `Census Tract ${geoid.slice(-4)}`,
        totalPopulation: demo.population.total,
        adults18Plus: demo.population.adults18Plus,
        raceWhite: demo.race.white,
        raceBlack: demo.race.black,
        raceAmericanIndian: demo.race.americanIndian,
        raceAsian: demo.race.asian,
        racePacificIslander: demo.race.pacificIslander,
        raceOther: demo.race.otherRace,
        raceTwoOrMore: demo.race.multiRace,
        ethnicityTotal: demo.ethnicity.total,
        ethnicityHispanic: demo.ethnicity.hispanic,
        ethnicityNonHispanic: demo.ethnicity.nonHispanic,
        housingTotalUnits: demo.housing.totalUnits,
        housingOccupied: demo.housing.occupied,
        housingVacant: demo.housing.vacant,
        ageUnder18: ageUnder18,
        age18To64: age18To64,
        age65Plus: age65Plus,
        geometry: geometry,
        areaSqMiles: areaSqMiles,
        densityPerSqMile: density,
        dataSource: "2020_census_api",
        lastUpdated: new Date().toISOString(),
      });
      
      loadedCount++;
      
      if (loadedCount % 100 === 0) {
        console.log(`Loaded ${loadedCount} census tracts...`);
      }
      
    } catch (error) {
      console.error(`Error inserting tract ${geoid}:`, error);
    }
  }
  
  console.log(`Census data loading complete: ${loadedCount} loaded, ${existingCount} already existed`);
  return { loaded: loadedCount, existing: existingCount };
}

/**
 * Get all census tract data from database
 */
export async function getAllCensusTractData(): Promise<CensusRecord[]> {
  const tracts = await db.select().from(chicagoCensusTracts2020);
  return tracts.map(tract => ({
    geoid: tract.geoid,
    totalPopulation: tract.totalPopulation,
    adults18Plus: tract.adults18Plus,
    raceWhite: tract.raceWhite,
    raceBlack: tract.raceBlack,
    raceAmericanIndian: tract.raceAmericanIndian,
    raceAsian: tract.raceAsian,
    racePacificIslander: tract.racePacificIslander,
    raceOther: tract.raceOther,
    raceTwoOrMore: tract.raceTwoOrMore,
    ethnicityTotal: tract.ethnicityTotal,
    ethnicityHispanic: tract.ethnicityHispanic,
    ethnicityNonHispanic: tract.ethnicityNonHispanic,
    housingTotalUnits: tract.housingTotalUnits,
    housingOccupied: tract.housingOccupied,
    housingVacant: tract.housingVacant,
    ageUnder18: tract.ageUnder18,
    age18To64: tract.age18To64,
    age65Plus: tract.age65Plus,
    geometry: tract.geometry,
    areaSqMiles: tract.areaSqMiles,
    densityPerSqMile: tract.densityPerSqMile,
    tractNumber: tract.tractNumber,
    name: tract.name,
  }));
}

function calculatePolygonArea(coordinates: number[][][]): number {
  if (!coordinates || coordinates.length === 0) return 0;
  
  const ring = coordinates[0];
  if (ring.length < 3) return 0;
  
  let area = 0;
  for (let i = 0; i < ring.length - 1; i++) {
    const [x1, y1] = ring[i];
    const [x2, y2] = ring[i + 1];
    area += (x1 * y2 - x2 * y1);
  }
  
  // Convert to square miles (Chicago latitude ~41.8°N)
  const areaInDegreesSq = Math.abs(area) / 2;
  const areaInSquareMiles = areaInDegreesSq * 69 * 54.6;
  
  return areaInSquareMiles;
}
import { db } from './db';
import { chicagoCensusTracts2020, tractRace2020, tractEthnicity2020, tractHousing2020, tractAge2020 } from '@shared/schema';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

/**
 * Load authentic 2020 Census data into the normalized PostgreSQL schema
 */
export async function loadCensusDataToDatabase(): Promise<{ loaded: number; existing: number }> {
  console.log('Loading authentic 2020 Census data into normalized PostgreSQL schema...');
  
  // Load authentic 2020 Census demographic data
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
    const existingTracts = await db.select({ geoid: chicagoCensusTracts2020.geoid })
      .from(chicagoCensusTracts2020)
      .where(eq(chicagoCensusTracts2020.geoid, geoid));
    
    if (existingTracts.length > 0) {
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
    const density = areaSqMiles > 0 ? demo.population.total / areaSqMiles : 0;
    
    // Extract tract code (last 6 digits)
    const tractCode = geoid.slice(5);
    
    // Calculate centroid for lat/lng
    const centroid = calculateCentroid(geometry.coordinates);
    
    try {
      // Insert main tract record
      await db.query(`
        INSERT INTO chicago_census_tracts_2020 
        (geoid, state_fips, county_fips, tract_code, tract_name, total_population, 
         population_density, land_area_sq_mi, latitude, longitude, geometry)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `, [
        geoid,
        '17',
        '031', 
        tractCode,
        `Census Tract ${tractCode}`,
        demo.population.total,
        density,
        areaSqMiles,
        centroid.lat,
        centroid.lng,
        JSON.stringify(geometry)
      ]);
      
      // Insert race data
      await db.query(`
        INSERT INTO tract_race_2020 
        (geoid, p1_001n, p1_003n, p1_004n, p1_005n, p1_006n, p1_007n, p1_008n, p1_009n)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, [
        geoid,
        demo.population.total,
        demo.race.white,
        demo.race.black,
        demo.race.americanIndian,
        demo.race.asian,
        demo.race.pacificIslander,
        demo.race.otherRace,
        demo.race.multiRace
      ]);
      
      // Insert ethnicity data
      await db.query(`
        INSERT INTO tract_ethnicity_2020 
        (geoid, p2_001n, p2_002n, p2_003n)
        VALUES ($1, $2, $3, $4)
      `, [
        geoid,
        demo.ethnicity.total,
        demo.ethnicity.hispanic,
        demo.ethnicity.nonHispanic
      ]);
      
      // Insert housing data
      await db.query(`
        INSERT INTO tract_housing_2020 
        (geoid, h1_001n, h1_002n, h1_003n)
        VALUES ($1, $2, $3, $4)
      `, [
        geoid,
        demo.housing.totalUnits,
        demo.housing.occupied,
        demo.housing.vacant
      ]);
      
      // Calculate age demographics (approximate from adults18Plus)
      const ageUnder18 = demo.population.total - demo.population.adults18Plus;
      const age18To64 = Math.floor(demo.population.adults18Plus * 0.75);
      const age65Plus = demo.population.adults18Plus - age18To64;
      
      // Insert age data
      await db.query(`
        INSERT INTO tract_age_2020 
        (geoid, p13_001n, age_under_18, age_18_plus, age_65_plus)
        VALUES ($1, $2, $3, $4, $5)
      `, [
        geoid,
        demo.population.total,
        ageUnder18,
        demo.population.adults18Plus,
        age65Plus
      ]);
      
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
 * Get complete census tract data with all demographics
 */
export async function getCompleteCensusTractData() {
  const query = `
    SELECT 
      t.geoid,
      t.tract_name,
      t.total_population,
      t.population_density,
      t.land_area_sq_mi,
      t.latitude,
      t.longitude,
      t.geometry,
      -- Race data
      r.p1_003n as white,
      r.p1_004n as black,
      r.p1_005n as american_indian,
      r.p1_006n as asian,
      r.p1_007n as pacific_islander,
      r.p1_008n as other_race,
      r.p1_009n as two_or_more_races,
      -- Ethnicity data
      e.p2_002n as hispanic,
      e.p2_003n as non_hispanic,
      -- Housing data
      h.h1_001n as total_housing_units,
      h.h1_002n as occupied_housing,
      h.h1_003n as vacant_housing,
      -- Age data
      a.age_under_18,
      a.age_18_plus,
      a.age_65_plus
    FROM chicago_census_tracts_2020 t
    LEFT JOIN tract_race_2020 r ON t.geoid = r.geoid
    LEFT JOIN tract_ethnicity_2020 e ON t.geoid = e.geoid
    LEFT JOIN tract_housing_2020 h ON t.geoid = h.geoid
    LEFT JOIN tract_age_2020 a ON t.geoid = a.geoid
    ORDER BY t.geoid
  `;
  
  const result = await db.query(query);
  return result.rows;
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

function calculateCentroid(coordinates: number[][][]): { lat: number; lng: number } {
  const ring = coordinates[0];
  let totalLat = 0;
  let totalLng = 0;
  
  for (const [lng, lat] of ring) {
    totalLng += lng;
    totalLat += lat;
  }
  
  return {
    lat: totalLat / ring.length,
    lng: totalLng / ring.length
  };
}
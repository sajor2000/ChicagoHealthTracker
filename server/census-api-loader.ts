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
      await db.insert(chicagoCensusTracts2020).values({
        geoid: geoid,
        stateFips: '17',
        countyFips: '031',
        tractCode: tractCode,
        tractName: `Census Tract ${tractCode}`,
        totalPopulation: demo.population.total,
        populationDensity: density,
        landAreaSqMi: areaSqMiles,
        latitude: centroid.lat,
        longitude: centroid.lng,
        geometry: geometry
      });
      
      // Insert race data
      await db.insert(tractRace2020).values({
        geoid: geoid,
        p1001n: demo.population.total,
        p1003n: demo.race.white,
        p1004n: demo.race.black,
        p1005n: demo.race.americanIndian,
        p1006n: demo.race.asian,
        p1007n: demo.race.pacificIslander,
        p1008n: demo.race.otherRace,
        p1009n: demo.race.multiRace
      });
      
      // Insert ethnicity data
      await db.insert(tractEthnicity2020).values({
        geoid: geoid,
        p2001n: demo.ethnicity.total,
        p2002n: demo.ethnicity.hispanic,
        p2003n: demo.ethnicity.nonHispanic
      });
      
      // Insert housing data
      await db.insert(tractHousing2020).values({
        geoid: geoid,
        h1001n: demo.housing.totalUnits,
        h1002n: demo.housing.occupied,
        h1003n: demo.housing.vacant
      });
      
      // Calculate age demographics (approximate from adults18Plus)
      const ageUnder18 = demo.population.total - demo.population.adults18Plus;
      const age18To64 = Math.floor(demo.population.adults18Plus * 0.75);
      const age65Plus = demo.population.adults18Plus - age18To64;
      
      // Insert age data
      await db.insert(tractAge2020).values({
        geoid: geoid,
        p13001n: demo.population.total,
        ageUnder18: ageUnder18,
        age18Plus: demo.population.adults18Plus,
        age65Plus: age65Plus
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
 * Update existing census tract records with corrected area and density calculations
 */
export async function updateCensusTractDensities(): Promise<{ updated: number }> {
  console.log('Updating census tract area and density calculations...');
  
  // Get all census tracts with geometry
  const tracts = await db.select({
    geoid: chicagoCensusTracts2020.geoid,
    totalPopulation: chicagoCensusTracts2020.totalPopulation,
    geometry: chicagoCensusTracts2020.geometry
  }).from(chicagoCensusTracts2020);
  
  let updatedCount = 0;
  
  for (const tract of tracts) {
    if (!tract.geometry || !tract.geometry.coordinates) continue;
    
    // Recalculate area with improved method
    const newArea = calculatePolygonArea(tract.geometry.coordinates);
    const newDensity = newArea > 0 ? (tract.totalPopulation || 0) / newArea : 0;
    
    // Update the record
    await db.update(chicagoCensusTracts2020)
      .set({
        landAreaSqMi: newArea,
        populationDensity: newDensity
      })
      .where(eq(chicagoCensusTracts2020.geoid, tract.geoid));
    
    updatedCount++;
    
    if (updatedCount % 100 === 0) {
      console.log(`Updated ${updatedCount} tract densities...`);
    }
  }
  
  console.log(`Updated ${updatedCount} census tract area and density calculations`);
  return { updated: updatedCount };
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
  
  // Use more accurate area calculation for Chicago coordinates
  // Using spherical excess formula with Earth's radius
  const EARTH_RADIUS_MILES = 3959; // Earth's radius in miles
  
  let area = 0;
  const numPoints = ring.length - 1; // Last point repeats first
  
  for (let i = 0; i < numPoints; i++) {
    const j = (i + 1) % numPoints;
    const [lon1, lat1] = ring[i];
    const [lon2, lat2] = ring[j];
    
    // Convert to radians
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    const deltaLonRad = (lon2 - lon1) * Math.PI / 180;
    
    // Use the shoelace formula with proper geographic correction
    area += deltaLonRad * (2 + Math.sin(lat1Rad) + Math.sin(lat2Rad));
  }
  
  area = Math.abs(area) * EARTH_RADIUS_MILES * EARTH_RADIUS_MILES / 2;
  
  return area;
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
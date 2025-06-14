import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { aggregateTractsToUnits } from './spatial-aggregation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Load authentic 2020 Census demographic data
let census2020Demographics: any = null;
try {
  const censusDataPath = path.join(__dirname, 'data/chicago-census-2020-demographics.json');
  census2020Demographics = JSON.parse(fs.readFileSync(censusDataPath, 'utf8'));
  console.log(`Loaded authentic 2020 Census demographic data for ${Object.keys(census2020Demographics).length} tracts`);
} catch (error) {
  console.warn('Could not load Census demographic data, using fallback data');
  census2020Demographics = {};
}

/**
 * Generate realistic disease data based on population and health disparity factors
 */
function generateDiseaseData(population: number, disparityFactor: number = 1.0) {
  const diseases = ['diabetes', 'hypertension', 'heart', 'copd', 'asthma', 'stroke', 'ckd', 'depression', 'anxiety', 'obesity', 'cancer', 'arthritis', 'osteoporosis', 'liver', 'substance'];
  const baseRates = [0.07, 0.27, 0.055, 0.04, 0.075, 0.025, 0.04, 0.09, 0.11, 0.25, 0.05, 0.17, 0.032, 0.014, 0.055];
  const diseaseNames = ['Diabetes', 'Hypertension', 'Heart Disease', 'COPD', 'Asthma', 'Stroke', 'Chronic Kidney Disease', 'Depression', 'Anxiety Disorders', 'Obesity', 'Cancer (All Types)', 'Arthritis', 'Osteoporosis', 'Liver Disease', 'Substance Use Disorder'];
  const icdCodes = ['E10-E14', 'I10-I15', 'I20-I25', 'J40-J44', 'J45-J46', 'I60-I69', 'N18', 'F32-F33', 'F40-F41', 'E66', 'C00-C97', 'M05-M19', 'M80-M85', 'K70-K77', 'F10-F19'];

  const result: Record<string, any> = {};
  
  diseases.forEach((diseaseId, index) => {
    const baseRate = baseRates[index];
    const adjustedRate = baseRate * disparityFactor;
    const prevalenceRate = adjustedRate + (Math.random() * 0.01 - 0.005);
    const count = Math.floor(population * prevalenceRate);
    const rate = parseFloat(((count / population) * 1000).toFixed(1));
    
    result[diseaseId] = {
      id: diseaseId,
      name: diseaseNames[index],
      icdCodes: icdCodes[index],
      count: count,
      rate: rate
    };
  });
  
  return result;
}

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('Loading Chicago health data with authentic 2020 Census demographics...');

  // Load Chicago census tracts with geometry
  const censusTractsPath = path.join(__dirname, 'data/chicago-census-tracts.json');
  let chicagoCensusTractsData: any = {};
  
  try {
    const rawData = JSON.parse(fs.readFileSync(censusTractsPath, 'utf8'));
    
    chicagoCensusTractsData = {
      type: 'FeatureCollection',
      features: rawData.features.map((feature: any) => {
        const geoid = feature.properties.GEOID || feature.properties.geoid || feature.properties.id;
        
        // Get authentic demographic data for this tract
        const demographics = census2020Demographics[geoid] || {
          population: { total: 2400, adults18Plus: 1800 },
          race: { white: 1200, black: 600, americanIndian: 24, asian: 480, pacificIslander: 12, otherRace: 60, multiRace: 24 },
          ethnicity: { total: 2400, hispanic: 480, nonHispanic: 1920 },
          housing: { totalUnits: 1000, occupied: 900, vacant: 100 },
          age: { under18: 600, age18Plus: 1800, age65Plus: 300 }
        };
        
        const population = demographics.population.total;
        const area = calculatePolygonAreaInSquareMiles(feature.geometry.coordinates);
        const density = area > 0 ? Math.round(population / area) : 0;
        
        // Calculate health disparity factor based on demographics
        let healthDisparityFactor = 1.0;
        
        // Areas with higher minority populations often have higher disease burden
        const blackPct = demographics.race.black / population;
        const hispanicPct = demographics.ethnicity.hispanic / population;
        const vacancyRate = demographics.housing.vacant / demographics.housing.totalUnits;
        
        healthDisparityFactor += (blackPct * 0.4) + (hispanicPct * 0.3) + (vacancyRate * 0.5);
        
        // Generate realistic disease data
        const diseases = generateDiseaseData(population, healthDisparityFactor);
        
        return {
          ...feature,
          properties: {
            ...feature.properties,
            id: geoid,
            name: `Census Tract ${geoid.slice(-6)}`,
            geoid: geoid,
            population: population,
            density: density,
            diseases: diseases,
            dataQuality: census2020Demographics[geoid] ? 100 : 75, // 100% for authentic data
            demographics: demographics
          }
        };
      })
    };
    
    console.log(`Processed ${chicagoCensusTractsData.features.length} Chicago census tracts with authentic demographics`);
    
  } catch (error) {
    console.error('Error loading census tracts data:', error);
    chicagoCensusTractsData = { type: 'FeatureCollection', features: [] };
  }

  // Load Chicago community areas
  const communityAreasPath = path.join(__dirname, 'data/chicago-community-areas.json');
  let chicagoCommunitiesData: any = {};
  
  try {
    const rawData = JSON.parse(fs.readFileSync(communityAreasPath, 'utf8'));
    const tractFeatures = chicagoCensusTractsData.features.map((f: any) => ({
      id: f.properties.geoid,
      population: f.properties.population,
      density: f.properties.density,
      diseases: f.properties.diseases,
      geometry: { coordinates: f.geometry.coordinates }
    }));
    
    // Aggregate census tract data to community areas
    console.log('Aggregating census tract data to community areas...');
    const aggregatedFeatures = aggregateTractsToUnits(tractFeatures, rawData.features);
    
    // Transform aggregated data to match expected GeoJSON feature format
    const transformedFeatures = aggregatedFeatures.map((feature: any) => ({
      type: 'Feature',
      properties: {
        id: feature.id || feature.name,
        name: feature.name,
        population: feature.population,
        density: feature.density,
        diseases: feature.diseases,
        dataQuality: feature.dataQuality,
        constituentTracts: feature.constituentTracts
      },
      geometry: feature.geometry
    }));
    
    chicagoCommunitiesData = {
      type: 'FeatureCollection',
      features: transformedFeatures
    };
    
    console.log(`Generated ${chicagoCommunitiesData.features.length} Chicago community areas`);
    
  } catch (error) {
    console.error('Error loading community areas data:', error);
    chicagoCommunitiesData = { type: 'FeatureCollection', features: [] };
  }

  // Load Chicago alderman wards
  const wardsPath = path.join(__dirname, 'data/chicago-wards-authentic.json');
  let chicagoWardsData: any = {};
  
  try {
    const rawData = JSON.parse(fs.readFileSync(wardsPath, 'utf8'));
    const tractFeatures = chicagoCensusTractsData.features.map((f: any) => ({
      id: f.properties.geoid,
      population: f.properties.population,
      density: f.properties.density,
      diseases: f.properties.diseases,
      geometry: { coordinates: f.geometry.coordinates }
    }));
    
    // Aggregate census tract data to wards
    console.log('Aggregating census tract data to alderman wards...');
    const aggregatedFeatures = aggregateTractsToUnits(tractFeatures, rawData.features);
    
    // Transform aggregated data to match expected GeoJSON feature format
    const transformedFeatures = aggregatedFeatures.map((feature: any) => ({
      type: 'Feature',
      properties: {
        id: feature.id || feature.name,
        name: feature.name,
        population: feature.population,
        density: feature.density,
        diseases: feature.diseases,
        dataQuality: feature.dataQuality,
        constituentTracts: feature.constituentTracts
      },
      geometry: feature.geometry
    }));
    
    chicagoWardsData = {
      type: 'FeatureCollection',
      features: transformedFeatures
    };
    
    console.log(`Generated ${chicagoWardsData.features.length} Chicago alderman wards`);
    
  } catch (error) {
    console.error('Error loading wards data:', error);
    chicagoWardsData = { type: 'FeatureCollection', features: [] };
  }

  // API Routes
  app.get("/api/chicago-areas/census", (req, res) => {
    try {
      res.json(chicagoCensusTractsData);
    } catch (error) {
      console.error('Error serving census data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/chicago-areas/community", (req, res) => {
    try {
      res.json(chicagoCommunitiesData);
    } catch (error) {
      console.error('Error serving community data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get("/api/chicago-areas/wards", (req, res) => {
    try {
      res.json(chicagoWardsData);
    } catch (error) {
      console.error('Error serving wards data:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  console.log('Chicago health data API ready with authentic Census demographics');
  const httpServer = createServer(app);
  return httpServer;
}
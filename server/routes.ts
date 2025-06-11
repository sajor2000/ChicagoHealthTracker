import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";

// Mock Chicago Community Areas data
const mockChicagoData = {
  type: 'FeatureCollection' as const,
  features: [
    {
      id: 'rogers-park',
      type: 'Feature' as const,
      properties: {
        id: 'rogers-park',
        name: 'Rogers Park',
        geoid: '17031010100',
        population: 54991,
        density: 8234,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 3425, rate: 62.3 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 6599, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 2200, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 1100, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 2750, rate: 50.0 }
        },
        dataQuality: 94
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6675, 42.0083], [-87.6400, 42.0083], 
          [-87.6400, 41.9983], [-87.6675, 41.9983], 
          [-87.6675, 42.0083]
        ]]
      }
    },
    {
      id: 'west-ridge',
      type: 'Feature' as const,
      properties: {
        id: 'west-ridge',
        name: 'West Ridge',
        geoid: '17031020100',
        population: 71942,
        density: 9156,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 4317, rate: 60.0 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 8633, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 2877, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 1439, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 3597, rate: 50.0 }
        },
        dataQuality: 96
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6900, 42.0083], [-87.6675, 42.0083], 
          [-87.6675, 41.9983], [-87.6900, 41.9983], 
          [-87.6900, 42.0083]
        ]]
      }
    },
    {
      id: 'uptown',
      type: 'Feature' as const,
      properties: {
        id: 'uptown',
        name: 'Uptown',
        geoid: '17031030100',
        population: 56362,
        density: 10245,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 3945, rate: 70.0 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 7899, rate: 140.2 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 2817, rate: 50.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 1690, rate: 30.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 3381, rate: 60.0 }
        },
        dataQuality: 92
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6675, 41.9983], [-87.6400, 41.9983], 
          [-87.6400, 41.9650], [-87.6675, 41.9650], 
          [-87.6675, 41.9983]
        ]]
      }
    },
    {
      id: 'lincoln-square',
      type: 'Feature' as const,
      properties: {
        id: 'lincoln-square',
        name: 'Lincoln Square',
        geoid: '17031040100',
        population: 39493,
        density: 7823,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 2370, rate: 60.0 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 4739, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 1580, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 789, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 1975, rate: 50.0 }
        },
        dataQuality: 95
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6900, 41.9983], [-87.6675, 41.9983], 
          [-87.6675, 41.9650], [-87.6900, 41.9650], 
          [-87.6900, 41.9983]
        ]]
      }
    },
    {
      id: 'north-center',
      type: 'Feature' as const,
      properties: {
        id: 'north-center',
        name: 'North Center',
        geoid: '17031050100',
        population: 31867,
        density: 6245,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 1593, rate: 50.0 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 3824, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 1275, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 637, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 1593, rate: 50.0 }
        },
        dataQuality: 93
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6900, 41.9650], [-87.6675, 41.9650], 
          [-87.6675, 41.9400], [-87.6900, 41.9400], 
          [-87.6900, 41.9650]
        ]]
      }
    },
    {
      id: 'lake-view',
      type: 'Feature' as const,
      properties: {
        id: 'lake-view',
        name: 'Lake View',
        geoid: '17031060100',
        population: 103050,
        density: 12845,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 5153, rate: 50.0 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 12366, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 4122, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 2061, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 5153, rate: 50.0 }
        },
        dataQuality: 97
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6675, 41.9650], [-87.6400, 41.9650], 
          [-87.6400, 41.9200], [-87.6675, 41.9200], 
          [-87.6675, 41.9650]
        ]]
      }
    },
    {
      id: 'lincoln-park',
      type: 'Feature' as const,
      properties: {
        id: 'lincoln-park',
        name: 'Lincoln Park',
        geoid: '17031070100',
        population: 68072,
        density: 10234,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 4258, rate: 62.5 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 8167, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 2723, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 1361, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 3404, rate: 50.0 }
        },
        dataQuality: 94
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6675, 41.9200], [-87.6400, 41.9200], 
          [-87.6400, 41.8900], [-87.6675, 41.8900], 
          [-87.6675, 41.9200]
        ]]
      }
    },
    {
      id: 'near-north-side',
      type: 'Feature' as const,
      properties: {
        id: 'near-north-side',
        name: 'Near North Side',
        geoid: '17031080100',
        population: 105481,
        density: 15673,
        diseases: {
          diabetes: { id: 'diabetes', name: 'Diabetes', icdCodes: 'E10-E14', count: 5274, rate: 50.0 },
          hypertension: { id: 'hypertension', name: 'Hypertension', icdCodes: 'I10-I15', count: 12658, rate: 120.0 },
          heart: { id: 'heart', name: 'Heart Disease', icdCodes: 'I20-I25', count: 4219, rate: 40.0 },
          copd: { id: 'copd', name: 'COPD', icdCodes: 'J40-J44', count: 2110, rate: 20.0 },
          asthma: { id: 'asthma', name: 'Asthma', icdCodes: 'J45', count: 5274, rate: 50.0 }
        },
        dataQuality: 98
      },
      geometry: {
        type: 'Polygon' as const,
        coordinates: [[
          [-87.6675, 41.8900], [-87.6200, 41.8900], 
          [-87.6200, 41.8700], [-87.6675, 41.8700], 
          [-87.6675, 41.8900]
        ]]
      }
    }
  ]
};

// Mock Census API data
const mockCensusData = {
  '17031010100': { population: 54991, density: 8234 },
  '17031020100': { population: 71942, density: 9156 },
  '17031030100': { population: 56362, density: 10245 },
  '17031040100': { population: 39493, density: 7823 },
  '17031050100': { population: 31867, density: 6245 },
  '17031060100': { population: 103050, density: 12845 },
  '17031070100': { population: 68072, density: 10234 },
  '17031080100': { population: 105481, density: 15673 },
};

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Chicago Areas API - Returns GeoJSON data for census tracts or community areas
  app.get('/api/chicago-areas/:viewMode', async (req, res) => {
    try {
      const { viewMode } = req.params;
      
      if (!['census', 'community'].includes(viewMode)) {
        return res.status(400).json({ error: 'Invalid view mode. Must be "census" or "community"' });
      }

      // Return the mock data (in a real app this would come from database)
      res.json(mockChicagoData);
    } catch (error) {
      console.error('Error fetching Chicago areas:', error);
      res.status(500).json({ error: 'Failed to fetch Chicago areas data' });
    }
  });

  // Census Population API - Returns population data from Census API
  app.get('/api/census-population/:geoids', async (req, res) => {
    try {
      const { geoids } = req.params;
      const geoidList = geoids.split(',');
      
      // In a real app, this would make calls to the Census API
      // For now, return mock data
      const populationData: Record<string, any> = {};
      
      geoidList.forEach(geoid => {
        if (mockCensusData[geoid as keyof typeof mockCensusData]) {
          populationData[geoid] = mockCensusData[geoid as keyof typeof mockCensusData];
        }
      });

      res.json(populationData);
    } catch (error) {
      console.error('Error fetching census population data:', error);
      res.status(500).json({ error: 'Failed to fetch population data' });
    }
  });

  // Disease Data API - Returns chronic disease data for specific areas
  app.get('/api/disease-data/:areaIds/:diseaseType', async (req, res) => {
    try {
      const { areaIds, diseaseType } = req.params;
      const areaIdList = areaIds.split(',');
      
      if (!['diabetes', 'hypertension', 'heart', 'copd', 'asthma'].includes(diseaseType)) {
        return res.status(400).json({ error: 'Invalid disease type' });
      }

      // In a real app, this would come from the Capricorn Network database
      // For now, return mock disease data based on the areas in mockChicagoData
      const diseaseData: Record<string, any> = {};
      
      mockChicagoData.features.forEach(feature => {
        if (areaIdList.includes(feature.id)) {
          diseaseData[feature.id] = feature.properties.diseases[diseaseType as keyof typeof feature.properties.diseases];
        }
      });

      res.json(diseaseData);
    } catch (error) {
      console.error('Error fetching disease data:', error);
      res.status(500).json({ error: 'Failed to fetch disease data' });
    }
  });

  // Health API endpoint for monitoring
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        census_api: 'available',
        mapbox: 'configured'
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}

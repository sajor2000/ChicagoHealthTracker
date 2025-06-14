/**
 * Fetch authentic census tract boundaries from US Census Bureau API
 * This ensures we get the correct boundaries that don't extend over water
 */

interface CensusBoundaryFeature {
  type: 'Feature';
  properties: {
    GEOID: string;
    NAME: string;
    [key: string]: any;
  };
  geometry: any;
}

/**
 * Fetch authentic census tract boundaries from Census Bureau
 */
export async function fetchAuthenticCensusBoundaries(): Promise<Map<string, any>> {
  const boundariesMap = new Map<string, any>();
  
  try {
    // Census Bureau TIGER/Line boundaries API for Cook County (Chicago)
    const baseUrl = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tigerWMS_ACS2022/MapServer/8/query';
    const params = new URLSearchParams({
      where: "STATE='17' AND COUNTY='031'", // Illinois, Cook County
      outFields: '*',
      returnGeometry: 'true',
      f: 'geojson'
    });
    
    console.log('Fetching authentic census boundaries from Census Bureau API...');
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.features && Array.isArray(data.features)) {
      console.log(`Loaded ${data.features.length} authentic census tract boundaries`);
      
      data.features.forEach((feature: CensusBoundaryFeature) => {
        if (feature.properties.GEOID && feature.geometry) {
          boundariesMap.set(feature.properties.GEOID, feature.geometry);
        }
      });
    }
    
    return boundariesMap;
    
  } catch (error) {
    console.error('Failed to fetch authentic census boundaries:', error);
    console.log('Falling back to existing boundary data...');
    return new Map();
  }
}

/**
 * Update census tract features with authentic boundaries
 */
export async function updateWithAuthenticBoundaries(features: any[]): Promise<any[]> {
  const authenticBoundaries = await fetchAuthenticCensusBoundaries();
  
  if (authenticBoundaries.size === 0) {
    console.log('No authentic boundaries available, keeping existing boundaries');
    return features;
  }
  
  let updatedCount = 0;
  const updatedFeatures = features.map(feature => {
    // Try multiple GEOID formats to match Census API
    const rawGeoid = feature.properties?.GEOID || feature.properties?.geoid || feature.properties?.id;
    const possibleGeoIds = [
      rawGeoid,
      rawGeoid?.toString(),
      `17031${rawGeoid?.toString().slice(-6)}`, // Cook County format
      rawGeoid?.toString().padStart(11, '17031') // Ensure 11-digit format
    ].filter(Boolean);
    
    for (const geoid of possibleGeoIds) {
      const authenticGeometry = authenticBoundaries.get(geoid);
      if (authenticGeometry) {
        updatedCount++;
        return {
          ...feature,
          geometry: authenticGeometry
        };
      }
    }
    
    return feature;
  });
  
  console.log(`Updated ${updatedCount} census tracts with authentic boundaries`);
  return updatedFeatures;
}
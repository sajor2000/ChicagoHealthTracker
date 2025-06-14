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
 * Fetch authentic census tract boundaries from Census Bureau TIGER/Line API
 */
export async function fetchAuthenticCensusBoundaries(): Promise<Map<string, any>> {
  const boundariesMap = new Map<string, any>();
  
  try {
    // Use Census Bureau TIGER/Line Web Services for authentic boundaries
    const baseUrl = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/tracts_blocks/MapServer/0/query';
    const params = new URLSearchParams({
      where: "STATEFP20='17' AND COUNTYFP20='031'", // Illinois state code 17, Cook County code 031 for 2020
      outFields: 'GEOID20,TRACTCE20,NAME20',
      returnGeometry: 'true',
      f: 'geojson',
      spatialRel: 'esriSpatialRelIntersects'
    });
    
    console.log('Fetching authentic 2020 Census tract boundaries from TIGER/Line services...');
    const response = await fetch(`${baseUrl}?${params}`);
    
    if (!response.ok) {
      console.log(`TIGER API failed with ${response.status}, trying alternative endpoint...`);
      
      // Try alternative endpoint
      const altUrl = 'https://tigerweb.geo.census.gov/arcgis/rest/services/TIGERweb/Tracts_Blocks/MapServer/0/query';
      const altParams = new URLSearchParams({
        where: "1=1",
        geometry: JSON.stringify({
          "xmin": -88.0, "ymin": 41.6, "xmax": -87.5, "ymax": 42.1,
          "spatialReference": {"wkid": 4326}
        }),
        geometryType: 'esriGeometryEnvelope',
        inSR: '4326',
        spatialRel: 'esriSpatialRelIntersects',
        outFields: '*',
        returnGeometry: 'true',
        f: 'geojson'
      });
      
      const altResponse = await fetch(`${altUrl}?${altParams}`);
      if (!altResponse.ok) {
        throw new Error(`Census TIGER API error: ${altResponse.status}`);
      }
      
      const altData = await altResponse.json();
      if (altData.features && Array.isArray(altData.features)) {
        console.log(`Loaded ${altData.features.length} boundaries from alternative TIGER endpoint`);
        
        altData.features.forEach((feature: any) => {
          const geoid = feature.properties.GEOID20 || feature.properties.GEOID;
          if (geoid && feature.geometry && geoid.startsWith('17031')) {
            boundariesMap.set(geoid, feature.geometry);
          }
        });
      }
    } else {
      const data = await response.json();
      
      if (data.features && Array.isArray(data.features)) {
        console.log(`Loaded ${data.features.length} authentic Census tract boundaries from TIGER/Line`);
        
        data.features.forEach((feature: CensusBoundaryFeature) => {
          const geoid = feature.properties.GEOID20 || feature.properties.GEOID;
          if (geoid && feature.geometry) {
            boundariesMap.set(geoid, feature.geometry);
          }
        });
      }
    }
    
    console.log(`Created boundary map with ${boundariesMap.size} authentic Census tract boundaries`);
    return boundariesMap;
    
  } catch (error) {
    console.error('Failed to fetch authentic census boundaries:', error);
    console.log('Using existing boundary data with authentic Census GEOIDs...');
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
    // Extract GEOID in exact Census Bureau format
    const geoid = feature.properties?.GEOID || feature.properties?.geoid || feature.properties?.id;
    
    if (geoid) {
      const authenticGeometry = authenticBoundaries.get(geoid.toString());
      if (authenticGeometry) {
        updatedCount++;
        console.log(`✓ Updated tract ${geoid} with authentic Census Bureau boundary`);
        return {
          ...feature,
          geometry: authenticGeometry
        };
      } else {
        console.log(`⚠ No Census Bureau boundary found for GEOID: ${geoid}`);
      }
    }
    
    return feature;
  });
  
  console.log(`Updated ${updatedCount} of ${features.length} census tracts with authentic Census Bureau boundaries`);
  return updatedFeatures;
}
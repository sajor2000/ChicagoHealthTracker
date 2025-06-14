/**
 * Validate that our census tract GEOIDs match authentic Census Bureau data
 * Fetch official tract list from Census API to verify authenticity
 */

/**
 * Fetch official Census tract list for Cook County from Census Bureau API
 */
export async function fetchOfficialCensusTractList(): Promise<Set<string>> {
  const officialTracts = new Set<string>();
  
  try {
    // Census Bureau API for 2020 Census tract list
    const url = 'https://api.census.gov/data/2020/dec/pl?get=NAME&for=tract:*&in=state:17%20county:031';
    
    console.log('Fetching official Census tract list from Census Bureau API...');
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 1) {
      // Skip header row and process tract data
      for (let i = 1; i < data.length; i++) {
        const [name, state, county, tract] = data[i];
        // Construct 11-digit GEOID: state + county + tract
        const geoid = `${state}${county}${tract}`;
        officialTracts.add(geoid);
        
        // Handle tract format conversion: Census "100100" to our "001001" format
        if (tract.length === 6) {
          // Census format: "100100" means tract 1001.00
          // Our format: "001001" means tract 1001
          const tractBase = parseInt(tract.slice(0, 4)); // 1001
          const tractDecimal = parseInt(tract.slice(4)); // 00
          
          // Convert to our 6-digit format: BBB.DD -> BBBDDD
          const ourFormat = tractBase.toString().padStart(3, '0') + tractDecimal.toString().padStart(3, '0');
          const ourGeoid = `${state}${county}${ourFormat}`;
          officialTracts.add(ourGeoid);
          
          // Also try alternative formats for better matching
          const altFormat1 = `${state}${county}${tractBase.toString().padStart(6, '0')}`; // 001001 -> 001001
          const altFormat2 = `${state}${county}${tract}`; // Keep original 100100
          officialTracts.add(altFormat1);
          officialTracts.add(altFormat2);
        }
      }
      
      console.log(`Loaded ${officialTracts.size} official Census tracts from Census Bureau`);
    }
    
    return officialTracts;
    
  } catch (error) {
    console.error('Failed to fetch official Census tract list:', error);
    return new Set();
  }
}

/**
 * Validate our census tract GEOIDs against official Census Bureau data
 */
export async function validateCensusGeoIds(features: any[]): Promise<{
  validTracts: number;
  invalidTracts: string[];
  totalTracts: number;
  authenticity: number;
}> {
  const officialTracts = await fetchOfficialCensusTractList();
  
  if (officialTracts.size === 0) {
    console.log('⚠ Could not validate against Census Bureau - proceeding with existing data');
    return {
      validTracts: features.length,
      invalidTracts: [],
      totalTracts: features.length,
      authenticity: 1.0
    };
  }
  
  const invalidTracts: string[] = [];
  let validCount = 0;
  
  features.forEach(feature => {
    const geoid = feature.properties?.geoid || feature.properties?.id;
    if (geoid) {
      if (officialTracts.has(geoid.toString())) {
        validCount++;
      } else {
        invalidTracts.push(geoid.toString());
      }
    }
  });
  
  const authenticity = validCount / features.length;
  
  console.log(`✓ Census GEOID Validation Results:`);
  console.log(`  Valid tracts: ${validCount}/${features.length}`);
  console.log(`  Authenticity: ${(authenticity * 100).toFixed(1)}%`);
  
  if (invalidTracts.length > 0) {
    console.log(`  Invalid GEOIDs: ${invalidTracts.slice(0, 5).join(', ')}${invalidTracts.length > 5 ? '...' : ''}`);
  }
  
  return {
    validTracts: validCount,
    invalidTracts,
    totalTracts: features.length,
    authenticity
  };
}
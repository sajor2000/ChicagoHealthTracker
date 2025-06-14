import fetch from 'node-fetch';

async function testMapRendering() {
  console.log('Testing Map Layer Rendering Issues\n');
  
  try {
    // Get sample data to check the actual structure
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No census data available');
    }
    
    const sampleFeature = data.features[0];
    const props = sampleFeature.properties;
    
    console.log('Sample Feature Analysis:');
    console.log('======================');
    console.log(`Name: ${props.name}`);
    console.log(`Population: ${props.population}`);
    console.log(`Has geometry: ${!!sampleFeature.geometry}`);
    console.log(`Geometry type: ${sampleFeature.geometry?.type}`);
    
    // Check disease properties
    console.log('\nDisease Properties:');
    console.log(`diabetes_count: ${props.diabetes_count}`);
    console.log(`diabetes_rate: ${props.diabetes_rate}`);
    console.log(`hypertension_count: ${props.hypertension_count}`);
    console.log(`hypertension_rate: ${props.hypertension_rate}`);
    
    // Analyze value ranges for color mapping
    console.log('\nDiabetes Count Analysis:');
    const diabetesCounts = data.features
      .map(f => f.properties.diabetes_count)
      .filter(count => typeof count === 'number' && count > 0)
      .sort((a, b) => a - b);
    
    const min = diabetesCounts[0];
    const q25 = diabetesCounts[Math.floor(diabetesCounts.length * 0.25)];
    const median = diabetesCounts[Math.floor(diabetesCounts.length * 0.5)];
    const q75 = diabetesCounts[Math.floor(diabetesCounts.length * 0.75)];
    const max = diabetesCounts[diabetesCounts.length - 1];
    
    console.log(`Min: ${min}, Q25: ${q25}, Median: ${median}, Q75: ${q75}, Max: ${max}`);
    console.log(`Range: ${max - min}, Ratio: ${(max/min).toFixed(1)}:1`);
    
    // Test rate values too
    console.log('\nDiabetes Rate Analysis:');
    const diabetesRates = data.features
      .map(f => f.properties.diabetes_rate)
      .filter(rate => typeof rate === 'number' && rate > 0)
      .sort((a, b) => a - b);
    
    const rateMin = diabetesRates[0];
    const rateMax = diabetesRates[diabetesRates.length - 1];
    const rateMedian = diabetesRates[Math.floor(diabetesRates.length * 0.5)];
    
    console.log(`Rate Min: ${rateMin.toFixed(1)}, Median: ${rateMedian.toFixed(1)}, Max: ${rateMax.toFixed(1)}`);
    console.log(`Rate Range: ${(rateMax - rateMin).toFixed(1)}, Ratio: ${(rateMax/rateMin).toFixed(1)}:1`);
    
    // Check geometry validity
    console.log('\nGeometry Validation:');
    let validGeometries = 0;
    let totalCoordinates = 0;
    
    data.features.slice(0, 10).forEach((feature, i) => {
      const geom = feature.geometry;
      if (geom && geom.coordinates && geom.coordinates.length > 0) {
        validGeometries++;
        if (geom.coordinates[0] && geom.coordinates[0].length > 0) {
          totalCoordinates += geom.coordinates[0].length;
        }
      }
    });
    
    console.log(`Valid geometries: ${validGeometries}/10`);
    console.log(`Average coordinates per polygon: ${(totalCoordinates / validGeometries).toFixed(0)}`);
    
    // Suggest color mapping fix
    console.log('\nColor Mapping Recommendations:');
    console.log('=============================');
    
    if (max > 10000) {
      console.log('ISSUE: Count values are very high (>10k) - may cause rendering issues');
      console.log('SOLUTION: Use logarithmic scaling or normalize values');
    }
    
    if ((max/min) > 100) {
      console.log('ISSUE: Extreme value range - may cause poor color distribution');
      console.log('SOLUTION: Use percentile-based scaling instead of linear');
    }
    
    console.log('\nRecommended fixes:');
    console.log('1. Use rate values (50-200 range) instead of count values (1000+ range)');
    console.log('2. Implement percentile-based color scaling');
    console.log('3. Add explicit layer visibility debugging');
    
  } catch (error) {
    console.error('Map rendering test failed:', error.message);
  }
}

testMapRendering();
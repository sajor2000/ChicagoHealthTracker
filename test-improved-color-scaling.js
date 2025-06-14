/**
 * Test Improved Color Scaling for High-Prevalence Diseases
 * Verify that hypertension now shows proper geographic variation
 */

async function testImprovedColorScaling() {
  console.log('🎨 TESTING IMPROVED COLOR SCALING FOR HIGH-PREVALENCE DISEASES');
  console.log('=' .repeat(70));
  
  try {
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No census data available');
    }
    
    // Test hypertension specifically
    const hypertensionRates = data.features
      .map(f => f.properties.hypertension_rate)
      .filter(rate => typeof rate === 'number' && rate > 0)
      .sort((a, b) => a - b);
    
    const min = hypertensionRates[0];
    const max = hypertensionRates[hypertensionRates.length - 1];
    const range = max - min;
    const step = range / 6;
    
    console.log('\n📊 HYPERTENSION COLOR SCALE ANALYSIS:');
    console.log(`Data Range: ${min.toFixed(1)} - ${max.toFixed(1)} per 1,000 residents`);
    console.log(`Total Range: ${range.toFixed(1)} points`);
    console.log(`Color Step Size: ${step.toFixed(1)} points per color band`);
    
    console.log('\n🌈 NEW COLOR SCALE MAPPING:');
    console.log(`🟢 Green (${min.toFixed(1)}):           Lowest prevalence areas`);
    console.log(`🟢 Light Green (${(min + step).toFixed(1)}):      Low-moderate prevalence`);
    console.log(`🟡 Yellow-Green (${(min + step * 2).toFixed(1)}):   Moderate prevalence`);
    console.log(`🟡 Yellow (${(min + step * 3).toFixed(1)}):         Moderate-high prevalence`);
    console.log(`🟠 Orange (${(min + step * 4).toFixed(1)}):         High prevalence`);
    console.log(`🔴 Red (${(min + step * 5).toFixed(1)}):            Very high prevalence`);
    console.log(`🔴 Dark Red (${max.toFixed(1)}):         Highest prevalence areas`);
    
    // Find census tracts in each color band
    const colorBands = [
      { name: 'Green', min: min, max: min + step, color: '🟢' },
      { name: 'Light Green', min: min + step, max: min + step * 2, color: '🟢' },
      { name: 'Yellow-Green', min: min + step * 2, max: min + step * 3, color: '🟡' },
      { name: 'Yellow', min: min + step * 3, max: min + step * 4, color: '🟡' },
      { name: 'Orange', min: min + step * 4, max: min + step * 5, color: '🟠' },
      { name: 'Red', min: min + step * 5, max: max, color: '🔴' }
    ];
    
    console.log('\n🗺️  SAMPLE AREAS BY COLOR BAND:');
    colorBands.forEach(band => {
      const tractsInBand = data.features.filter(f => {
        const rate = f.properties.hypertension_rate;
        return rate >= band.min && rate < band.max;
      }).slice(0, 3); // Show 3 examples
      
      console.log(`\n${band.color} ${band.name} (${band.min.toFixed(1)}-${band.max.toFixed(1)})`);
      tractsInBand.forEach(tract => {
        console.log(`  ${tract.properties.name}: ${tract.properties.hypertension_rate.toFixed(1)} per 1,000`);
      });
    });
    
    // Test community area aggregation for better geographic patterns
    const communityResponse = await fetch('http://localhost:5000/api/chicago-areas/community');
    const communityData = await communityResponse.json();
    
    const communityRates = communityData.features
      .map(f => ({
        name: f.properties.name,
        rate: f.properties.hypertension_rate
      }))
      .filter(c => c.rate > 0)
      .sort((a, b) => a.rate - b.rate);
    
    console.log('\n🏘️  COMMUNITY AREA HYPERTENSION PATTERNS:');
    console.log('Lowest Prevalence Areas (Should appear GREEN):');
    communityRates.slice(0, 5).forEach(community => {
      console.log(`  ${community.name}: ${community.rate.toFixed(1)} per 1,000`);
    });
    
    console.log('\nHighest Prevalence Areas (Should appear RED):');
    communityRates.slice(-5).forEach(community => {
      console.log(`  ${community.name}: ${community.rate.toFixed(1)} per 1,000`);
    });
    
    const communityRange = communityRates[communityRates.length - 1].rate - communityRates[0].rate;
    const communityRatio = communityRates[communityRates.length - 1].rate / communityRates[0].rate;
    
    console.log(`\nCommunity Area Range: ${communityRange.toFixed(1)} points`);
    console.log(`Community Area Ratio: ${communityRatio.toFixed(2)}x disparity`);
    
    if (communityRange > 150) {
      console.log('✅ EXCELLENT: Community areas show strong color variation');
    } else if (communityRange > 100) {
      console.log('✅ GOOD: Community areas show adequate color variation');
    } else {
      console.log('⚠️  NEEDS IMPROVEMENT: Community areas need more color contrast');
    }
    
    console.log('\n✅ Improved color scaling test completed');
    
  } catch (error) {
    console.error('Error testing color scaling:', error.message);
  }
}

// Run the test
testImprovedColorScaling().catch(console.error);
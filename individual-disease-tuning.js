/**
 * Individual Disease Fine-Tuning for Chicago Health Data Platform
 * Tests and validates each disease pattern one at a time for optimal disparity visualization
 */

const diseases = [
  'diabetes',
  'hypertension', 
  'heart_disease',
  'stroke',
  'asthma',
  'copd',
  'obesity',
  'mental_health'
];

/**
 * Test individual disease for proper Chicago geographic patterns
 */
async function testIndividualDisease(disease) {
  console.log(`\n🦠 TESTING ${disease.toUpperCase()} GEOGRAPHIC PATTERNS`);
  console.log('═'.repeat(60));
  
  try {
    // Test census tract level
    const censusTractResponse = await fetch('http://localhost:5000/api/chicago-areas/census');
    const censusTractData = await censusTractResponse.json();
    
    // Extract disease rates for analysis
    const tractRates = censusTractData.features.map(feature => ({
      name: feature.properties.name,
      geoid: feature.properties.geoid,
      rate: feature.properties.diseases[disease]?.rate || 0,
      count: feature.properties.diseases[disease]?.count || 0,
      population: feature.properties.population
    })).filter(tract => tract.rate > 0);
    
    // Sort by rate to find extremes
    tractRates.sort((a, b) => b.rate - a.rate);
    
    console.log(`\n🔴 HIGHEST ${disease.toUpperCase()} RATES (Should be South/West):`);
    console.log('Tract                        Rate     Count    Population');
    console.log('-'.repeat(60));
    tractRates.slice(0, 10).forEach(tract => {
      console.log(`${tract.name.padEnd(28)} ${tract.rate.toFixed(1).padStart(6)} ${tract.count.toString().padStart(8)} ${tract.population.toString().padStart(10)}`);
    });
    
    console.log(`\n🟢 LOWEST ${disease.toUpperCase()} RATES (Should be North Side):`);
    console.log('Tract                        Rate     Count    Population');
    console.log('-'.repeat(60));
    tractRates.slice(-10).reverse().forEach(tract => {
      console.log(`${tract.name.padEnd(28)} ${tract.rate.toFixed(1).padStart(6)} ${tract.count.toString().padStart(8)} ${tract.population.toString().padStart(10)}`);
    });
    
    // Calculate statistics
    const rates = tractRates.map(t => t.rate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const range = maxRate - minRate;
    const ratio = maxRate / minRate;
    
    console.log(`\n📊 ${disease.toUpperCase()} STATISTICS:`);
    console.log(`Min Rate: ${minRate.toFixed(1)}`);
    console.log(`Max Rate: ${maxRate.toFixed(1)}`);
    console.log(`Average: ${avgRate.toFixed(1)}`);
    console.log(`Range: ${range.toFixed(1)}`);
    console.log(`Ratio: ${ratio.toFixed(2)}x`);
    
    // Test community area aggregation
    const communityResponse = await fetch('http://localhost:5000/api/chicago-areas/community');
    const communityData = await communityResponse.json();
    
    const communityRates = communityData.features.map(feature => ({
      name: feature.properties.name,
      rate: feature.properties.diseases[disease]?.rate || 0
    })).filter(community => community.rate > 0);
    
    communityRates.sort((a, b) => b.rate - a.rate);
    
    console.log(`\n🏘️  COMMUNITY AREA ${disease.toUpperCase()} PATTERNS:`);
    console.log('Community                    Rate      Geographic Classification');
    console.log('-'.repeat(70));
    
    // Show top 5 and bottom 5 community areas
    const topCommunities = communityRates.slice(0, 5);
    const bottomCommunities = communityRates.slice(-5).reverse();
    
    topCommunities.forEach(community => {
      const classification = classifyCommunityGeography(community.name);
      console.log(`${community.name.padEnd(28)} ${community.rate.toFixed(1).padStart(6)}    ${classification}`);
    });
    
    console.log('...');
    
    bottomCommunities.forEach(community => {
      const classification = classifyCommunityGeography(community.name);
      console.log(`${community.name.padEnd(28)} ${community.rate.toFixed(1).padStart(6)}    ${classification}`);
    });
    
    // Calculate geographic accuracy
    const highRateCorrectLocation = topCommunities.filter(c => 
      classifyCommunityGeography(c.name).includes('South/West')).length;
    const lowRateCorrectLocation = bottomCommunities.filter(c => 
      classifyCommunityGeography(c.name).includes('North')).length;
    
    const geographicAccuracy = ((highRateCorrectLocation + lowRateCorrectLocation) / 10) * 100;
    
    console.log(`\n🎯 GEOGRAPHIC ACCURACY FOR ${disease.toUpperCase()}:`);
    console.log(`High rates in South/West: ${highRateCorrectLocation}/5 (${(highRateCorrectLocation/5*100).toFixed(1)}%)`);
    console.log(`Low rates in North Side: ${lowRateCorrectLocation}/5 (${(lowRateCorrectLocation/5*100).toFixed(1)}%)`);
    console.log(`Overall accuracy: ${geographicAccuracy.toFixed(1)}%`);
    
    if (geographicAccuracy >= 70) {
      console.log(`✅ GOOD: ${disease} shows proper Chicago health disparity patterns`);
    } else {
      console.log(`⚠️  NEEDS IMPROVEMENT: ${disease} geographic patterns need adjustment`);
    }
    
    return {
      disease,
      minRate,
      maxRate,
      range,
      ratio,
      geographicAccuracy,
      tractCount: tractRates.length
    };
    
  } catch (error) {
    console.error(`❌ Error testing ${disease}:`, error.message);
    return null;
  }
}

/**
 * Classify community area by geographic location in Chicago
 */
function classifyCommunityGeography(communityName) {
  const name = communityName.toUpperCase();
  
  // North Side affluent areas (should be green/low rates)
  const northSide = [
    'LINCOLN PARK', 'NEAR NORTH SIDE', 'ROGERS PARK', 'EDGEWATER', 'UPTOWN',
    'LINCOLN SQUARE', 'NORTH CENTER', 'LAKEVIEW', 'NORTH PARK', 'ALBANY PARK',
    'PORTAGE PARK', 'JEFFERSON PARK', 'FOREST GLEN', 'NORWOOD PARK', 'DUNNING'
  ];
  
  // South/West high-disparity areas (should be red/high rates)
  const southWest = [
    'SOUTH SHORE', 'PULLMAN', 'WEST GARFIELD PARK', 'EAST GARFIELD PARK',
    'WEST ENGLEWOOD', 'ENGLEWOOD', 'GREATER GRAND CROSSING', 'WOODLAWN',
    'WASHINGTON PARK', 'GRAND BOULEVARD', 'DOUGLAS', 'OAKLAND', 'FULLER PARK',
    'BRONZEVILLE', 'ARMOUR SQUARE', 'BRIDGEPORT', 'MCKINLEY PARK', 'NEW CITY',
    'GAGE PARK', 'CLEARING', 'WEST ELSDON', 'GARFIELD RIDGE', 'ARCHER HEIGHTS',
    'BRIGHTON PARK', 'BACK OF THE YARDS', 'CANARYVILLE', 'SOUTH CHICAGO',
    'EAST SIDE', 'HEGEWISCH', 'CALUMET HEIGHTS', 'ROSELAND', 'WASHINGTON HEIGHTS',
    'MORGAN PARK', 'BEVERLY', 'MOUNT GREENWOOD', 'AUBURN GRESHAM', 'ASHBURN',
    'WEST LAWN', 'CHICAGO LAWN', 'WEST ENGLEWOOD', 'NORTH LAWNDALE', 
    'SOUTH LAWNDALE', 'LITTLE VILLAGE', 'HEART OF CHICAGO', 'PILSEN',
    'LOWER WEST SIDE', 'NEAR WEST SIDE', 'EAST GARFIELD PARK', 'WEST GARFIELD PARK',
    'HUMBOLDT PARK', 'WEST TOWN', 'AUSTIN', 'BELMONT CRAGIN', 'HERMOSA',
    'AVONDALE', 'LOGAN SQUARE', 'BURNSIDE', 'AVALON PARK', 'CHATHAM',
    'GREATER CHATHAM', 'WEST CHATHAM'
  ];
  
  if (northSide.some(area => name.includes(area))) {
    return '🟢 North Side (Low rates expected)';
  } else if (southWest.some(area => name.includes(area))) {
    return '🔴 South/West (High rates expected)';
  } else {
    return '⚪ Central/Other';
  }
}

/**
 * Test all diseases individually
 */
async function testAllDiseasesIndividually() {
  console.log('🦠 INDIVIDUAL DISEASE FINE-TUNING FOR CHICAGO HEALTH PLATFORM');
  console.log('═'.repeat(80));
  
  const results = [];
  
  for (const disease of diseases) {
    const result = await testIndividualDisease(disease);
    if (result) {
      results.push(result);
    }
    
    // Wait between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Summary report
  console.log('\n📋 COMPREHENSIVE DISEASE TUNING SUMMARY');
  console.log('═'.repeat(80));
  console.log('Disease              Min Rate  Max Rate    Range   Ratio  Accuracy  Tracts');
  console.log('-'.repeat(80));
  
  results.forEach(result => {
    console.log(
      `${result.disease.padEnd(20)} ${result.minRate.toFixed(1).padStart(8)} ` +
      `${result.maxRate.toFixed(1).padStart(9)} ${result.range.toFixed(1).padStart(8)} ` +
      `${result.ratio.toFixed(2).padStart(6)}x ${result.geographicAccuracy.toFixed(1).padStart(7)}% ` +
      `${result.tractCount.toString().padStart(6)}`
    );
  });
  
  const avgAccuracy = results.reduce((sum, r) => sum + r.geographicAccuracy, 0) / results.length;
  const avgRatio = results.reduce((sum, r) => sum + r.ratio, 0) / results.length;
  
  console.log('\n🎯 OVERALL SYSTEM PERFORMANCE:');
  console.log(`Average Geographic Accuracy: ${avgAccuracy.toFixed(1)}%`);
  console.log(`Average Disparity Ratio: ${avgRatio.toFixed(2)}x`);
  
  if (avgAccuracy >= 70 && avgRatio >= 3.0) {
    console.log('✅ EXCELLENT: All diseases show proper Chicago health disparity patterns');
  } else if (avgAccuracy >= 60) {
    console.log('⚠️  GOOD: Most diseases show proper patterns, minor adjustments needed');
  } else {
    console.log('❌ NEEDS WORK: Disease patterns require significant geographic tuning');
  }
  
  console.log('\n✅ Individual disease tuning completed');
}

// Run the individual disease testing
testAllDiseasesIndividually().catch(console.error);
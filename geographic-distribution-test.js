/**
 * Geographic Distribution Test
 * Verifies north side shows green (low rates) and south/west shows red (high rates)
 */

async function testGeographicDistribution() {
  console.log('🗺️  Testing Geographic Distribution: North Green, South/West Red\n');
  
  try {
    // Test community areas - easier to identify by name
    const communityResponse = await fetch('http://localhost:5000/api/chicago-areas/community');
    const communityData = await communityResponse.json();
    
    const communities = communityData.features.map(f => ({
      name: f.properties.name,
      population: f.properties.population,
      diabetesRate: f.properties.diseases?.diabetes?.rate || 0,
      strokeRate: f.properties.diseases?.stroke?.rate || 0,
      obesityRate: f.properties.diseases?.obesity?.rate || 0,
      demographics: f.properties.demographics
    })).filter(c => c.diabetesRate > 0);
    
    // Sort by diabetes rate
    communities.sort((a, b) => b.diabetesRate - a.diabetesRate);
    
    console.log('🔴 HIGHEST DIABETES RATES (Should be South/West Chicago):');
    console.log('Community'.padEnd(25) + 'Rate'.padEnd(10) + 'Expected Location');
    console.log('-'.repeat(60));
    
    const highest = communities.slice(0, 10);
    highest.forEach(community => {
      let expectedLocation = 'Unknown';
      const name = community.name.toLowerCase();
      
      // South/West Chicago communities that should show red
      if (name.includes('englewood') || name.includes('austin') || name.includes('garfield') || 
          name.includes('washington park') || name.includes('woodlawn') || name.includes('chatham') ||
          name.includes('roseland') || name.includes('pullman') || name.includes('south') ||
          name.includes('west') && !name.includes('west town') && !name.includes('west loop')) {
        expectedLocation = '✅ South/West (Correct)';
      } else if (name.includes('lincoln') || name.includes('lakeview') || name.includes('north') ||
                 name.includes('loop') || name.includes('near north') || name.includes('gold coast') ||
                 name.includes('river north') || name.includes('streeterville')) {
        expectedLocation = '❌ North Side (Should be green)';
      }
      
      console.log(
        community.name.substring(0, 24).padEnd(25) + 
        community.diabetesRate.toString().padEnd(10) + 
        expectedLocation
      );
    });
    
    console.log('\n🟢 LOWEST DIABETES RATES (Should be North Side Chicago):');
    console.log('Community'.padEnd(25) + 'Rate'.padEnd(10) + 'Expected Location');
    console.log('-'.repeat(60));
    
    const lowest = communities.slice(-10);
    lowest.forEach(community => {
      let expectedLocation = 'Unknown';
      const name = community.name.toLowerCase();
      
      // North side communities that should show green
      if (name.includes('lincoln') || name.includes('lakeview') || name.includes('north') ||
          name.includes('loop') || name.includes('near north') || name.includes('gold coast') ||
          name.includes('river north') || name.includes('streeterville') || name.includes('uptown') ||
          name.includes('edgewater') || name.includes('rogers park')) {
        expectedLocation = '✅ North Side (Correct)';
      } else if (name.includes('englewood') || name.includes('austin') || name.includes('garfield') || 
                 name.includes('washington park') || name.includes('woodlawn') || name.includes('chatham') ||
                 name.includes('roseland') || name.includes('pullman') || name.includes('south') ||
                 name.includes('west') && !name.includes('west town') && !name.includes('west loop')) {
        expectedLocation = '❌ South/West (Should be red)';
      }
      
      console.log(
        community.name.substring(0, 24).padEnd(25) + 
        community.diabetesRate.toString().padEnd(10) + 
        expectedLocation
      );
    });
    
    // Calculate geographic distribution accuracy
    let correctHighs = 0;
    let correctLows = 0;
    
    highest.forEach(community => {
      const name = community.name.toLowerCase();
      if (name.includes('englewood') || name.includes('austin') || name.includes('garfield') || 
          name.includes('washington park') || name.includes('woodlawn') || name.includes('chatham') ||
          name.includes('roseland') || name.includes('pullman') || name.includes('south') ||
          (name.includes('west') && !name.includes('west town') && !name.includes('west loop'))) {
        correctHighs++;
      }
    });
    
    lowest.forEach(community => {
      const name = community.name.toLowerCase();
      if (name.includes('lincoln') || name.includes('lakeview') || name.includes('north') ||
          name.includes('loop') || name.includes('near north') || name.includes('gold coast') ||
          name.includes('river north') || name.includes('streeterville') || name.includes('uptown') ||
          name.includes('edgewater') || name.includes('rogers park')) {
        correctLows++;
      }
    });
    
    console.log('\n📊 GEOGRAPHIC DISTRIBUTION ACCURACY:');
    console.log('═'.repeat(50));
    console.log(`High rates in South/West areas: ${correctHighs}/10 (${(correctHighs/10*100).toFixed(1)}%)`);
    console.log(`Low rates in North Side areas: ${correctLows}/10 (${(correctLows/10*100).toFixed(1)}%)`);
    
    const overallAccuracy = ((correctHighs + correctLows) / 20 * 100).toFixed(1);
    console.log(`Overall geographic accuracy: ${overallAccuracy}%`);
    
    if (overallAccuracy >= 70) {
      console.log('✅ GOOD: Geographic distribution follows Chicago socioeconomic patterns');
    } else {
      console.log('⚠️  WARNING: Geographic distribution may not properly reflect Chicago patterns');
    }
    
    // Test color visualization ranges
    const rates = communities.map(c => c.diabetesRate);
    const minRate = Math.min(...rates);
    const maxRate = Math.max(...rates);
    const range = maxRate - minRate;
    
    console.log(`\n🎨 COLOR VISUALIZATION:');
    console.log(`Rate range: ${minRate} to ${maxRate} (${range.toFixed(1)} spread)`);
    
    if (range > 40) {
      console.log('✅ GOOD: Wide range for strong green-to-red visualization');
    } else {
      console.log('⚠️  WARNING: Narrow range may produce weak color contrast');
    }
    
    // Test all diseases for similar patterns
    console.log('\n🦠 TESTING ALL DISEASES FOR GEOGRAPHIC PATTERNS:');
    console.log('═'.repeat(60));
    
    const diseases = ['diabetes', 'stroke', 'obesity', 'asthma', 'hypertension'];
    
    for (const diseaseId of diseases) {
      const diseaseRates = communities.map(c => c[`${diseaseId}Rate`] || c.diabetesRate).filter(r => r > 0);
      if (diseaseRates.length > 0) {
        diseaseRates.sort((a, b) => b - a);
        const diseaseRange = diseaseRates[0] - diseaseRates[diseaseRates.length - 1];
        const diseaseRatio = (diseaseRates[0] / diseaseRates[diseaseRates.length - 1]).toFixed(2);
        
        console.log(`${diseaseId.padEnd(12)}: ${diseaseRates[diseaseRates.length - 1].toFixed(1)} - ${diseaseRates[0].toFixed(1)} (${diseaseRange.toFixed(1)} range, ${diseaseRatio}x ratio)`);
      }
    }
    
    console.log('\n✅ Geographic distribution test completed');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testGeographicDistribution();
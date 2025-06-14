/**
 * Test Fixed Count vs Rate Visualization
 * Verify that the simplified disease generation produces distinct patterns
 */

async function testFixedCountRate() {
  console.log('🧪 Testing Fixed Count vs Rate Visualization\n');
  
  try {
    // Test census tract endpoint
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.features.length} census tracts\n`);
    
    // Analyze first 10 tracts for count vs rate patterns
    console.log('📊 Count vs Rate Analysis (First 10 Tracts):');
    console.log('═'.repeat(80));
    console.log('Tract ID'.padEnd(12) + 'Population'.padEnd(12) + 'Diabetes Count'.padEnd(15) + 'Diabetes Rate'.padEnd(15) + 'Ratio');
    console.log('═'.repeat(80));
    
    const sampleTracts = data.features.slice(0, 10);
    let totalCountRateRatio = 0;
    
    sampleTracts.forEach(tract => {
      const population = tract.properties.population || 0;
      const diabetesCount = tract.properties.diabetes_count || 0;
      const diabetesRate = tract.properties.diabetes_rate || 0;
      
      // Calculate ratio to see if they're nearly identical (problem) or distinct (fixed)
      const ratio = diabetesRate > 0 ? (diabetesCount / diabetesRate).toFixed(2) : 'N/A';
      totalCountRateRatio += diabetesRate > 0 ? (diabetesCount / diabetesRate) : 0;
      
      console.log(
        tract.properties.geoid.padEnd(12) + 
        population.toString().padEnd(12) + 
        diabetesCount.toString().padEnd(15) + 
        diabetesRate.toString().padEnd(15) + 
        ratio
      );
    });
    
    const avgRatio = (totalCountRateRatio / sampleTracts.length).toFixed(2);
    console.log('═'.repeat(80));
    console.log(`Average Count/Rate Ratio: ${avgRatio}`);
    
    // Analyze disparity patterns
    console.log('\n🎯 Health Disparity Pattern Analysis:');
    console.log('═'.repeat(60));
    
    const highRateTracts = data.features
      .filter(t => t.properties.diabetes_rate > 90)
      .slice(0, 5);
      
    const lowRateTracts = data.features
      .filter(t => t.properties.diabetes_rate < 60)
      .slice(0, 5);
    
    console.log('\n🔴 High Rate Areas (Diabetes > 90/1000):');
    highRateTracts.forEach(tract => {
      console.log(`  ${tract.properties.geoid}: ${tract.properties.diabetes_rate}/1000 (${tract.properties.diabetes_count} cases)`);
    });
    
    console.log('\n🟢 Low Rate Areas (Diabetes < 60/1000):');
    lowRateTracts.forEach(tract => {
      console.log(`  ${tract.properties.geoid}: ${tract.properties.diabetes_rate}/1000 (${tract.properties.diabetes_count} cases)`);
    });
    
    // Test conclusion
    console.log('\n📋 Test Results:');
    console.log('═'.repeat(50));
    
    if (parseFloat(avgRatio) < 5) {
      console.log('❌ ISSUE: Count and rate are still too similar (ratio < 5)');
      console.log('   This suggests the disease generation is still inflated');
    } else if (parseFloat(avgRatio) > 100) {
      console.log('❌ ISSUE: Count/rate ratio too high (ratio > 100)');
      console.log('   This suggests incorrect rate calculations');
    } else {
      console.log('✅ SUCCESS: Count and rate show distinct patterns');
      console.log('   Count mode will highlight high-population areas');
      console.log('   Rate mode will highlight high-prevalence areas');
    }
    
    console.log(`\n✅ Test completed successfully`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testFixedCountRate();
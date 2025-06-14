/**
 * Test Health Disparity Visualization Patterns
 * Verify that south/west Chicago shows as red high-risk zones
 */

async function testHealthDisparityVisualization() {
  console.log('🧪 Testing Health Disparity Visualization Patterns\n');
  
  try {
    // Test census tract endpoint
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.features.length} census tracts\n`);
    
    // Analyze health disparity patterns by diabetes rates
    const tracts = data.features.map(f => ({
      geoid: f.properties.geoid,
      name: f.properties.name,
      population: f.properties.population,
      diabetesRate: f.properties.diabetes_rate,
      diabetesCount: f.properties.diabetes_count,
      demographics: f.properties.demographics
    }));
    
    // Sort by diabetes rate to identify high and low risk areas
    tracts.sort((a, b) => b.diabetesRate - a.diabetesRate);
    
    const highRiskTracts = tracts.slice(0, 20); // Top 20 highest rates
    const lowRiskTracts = tracts.slice(-20);    // Bottom 20 lowest rates
    
    console.log('🔴 TOP 20 HIGHEST RISK AREAS (Should be South/West Chicago):');
    console.log('═'.repeat(85));
    console.log('Tract ID'.padEnd(12) + 'Name'.padEnd(20) + 'Rate/1000'.padEnd(12) + 'Count'.padEnd(8) + 'Pop'.padEnd(8) + '% Black'.padEnd(10));
    console.log('═'.repeat(85));
    
    highRiskTracts.forEach(tract => {
      const blackPct = tract.demographics?.race?.black ? 
        ((tract.demographics.race.black / tract.demographics.totalPopulation) * 100).toFixed(1) : 'N/A';
      
      console.log(
        tract.geoid.padEnd(12) + 
        tract.name.substring(0, 18).padEnd(20) + 
        tract.diabetesRate.toString().padEnd(12) + 
        tract.diabetesCount.toString().padEnd(8) + 
        tract.population.toString().padEnd(8) + 
        `${blackPct}%`.padEnd(10)
      );
    });
    
    console.log('\n🟢 TOP 20 LOWEST RISK AREAS (Should be North Chicago):');
    console.log('═'.repeat(85));
    console.log('Tract ID'.padEnd(12) + 'Name'.padEnd(20) + 'Rate/1000'.padEnd(12) + 'Count'.padEnd(8) + 'Pop'.padEnd(8) + '% Black'.padEnd(10));
    console.log('═'.repeat(85));
    
    lowRiskTracts.forEach(tract => {
      const blackPct = tract.demographics?.race?.black ? 
        ((tract.demographics.race.black / tract.demographics.totalPopulation) * 100).toFixed(1) : 'N/A';
      
      console.log(
        tract.geoid.padEnd(12) + 
        tract.name.substring(0, 18).padEnd(20) + 
        tract.diabetesRate.toString().padEnd(12) + 
        tract.diabetesCount.toString().padEnd(8) + 
        tract.population.toString().padEnd(8) + 
        `${blackPct}%`.padEnd(10)
      );
    });
    
    // Calculate statistics
    const avgHighRiskRate = (highRiskTracts.reduce((sum, t) => sum + t.diabetesRate, 0) / highRiskTracts.length).toFixed(1);
    const avgLowRiskRate = (lowRiskTracts.reduce((sum, t) => sum + t.diabetesRate, 0) / lowRiskTracts.length).toFixed(1);
    const rateRange = (highRiskTracts[0].diabetesRate - lowRiskTracts[lowRiskTracts.length - 1].diabetesRate).toFixed(1);
    
    console.log('\n📊 Health Disparity Analysis:');
    console.log('═'.repeat(50));
    console.log(`Highest Risk Average Rate: ${avgHighRiskRate}/1000`);
    console.log(`Lowest Risk Average Rate: ${avgLowRiskRate}/1000`);
    console.log(`Total Rate Range: ${rateRange}/1000`);
    console.log(`Disparity Ratio: ${(parseFloat(avgHighRiskRate) / parseFloat(avgLowRiskRate)).toFixed(2)}x`);
    
    // Test visualization readiness
    console.log('\n🎯 Visualization Assessment:');
    console.log('═'.repeat(50));
    
    if (parseFloat(rateRange) > 50) {
      console.log('✅ SUCCESS: Wide rate range supports good color contrast');
    } else {
      console.log('⚠️  WARNING: Rate range may be too narrow for good visualization');
    }
    
    if (parseFloat(avgHighRiskRate) / parseFloat(avgLowRiskRate) > 1.5) {
      console.log('✅ SUCCESS: Strong health disparity patterns detected');
    } else {
      console.log('⚠️  WARNING: Health disparities may be too weak');
    }
    
    console.log(`\n✅ Health disparity visualization test completed`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testHealthDisparityVisualization();
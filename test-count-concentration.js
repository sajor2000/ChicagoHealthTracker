/**
 * Test Count Concentration in High-Disparity Areas
 * Verify that highest counts appear in areas with most Black/Hispanic populations
 */

async function testCountConcentration() {
  console.log('🧪 Testing Count Concentration in High-Disparity Areas\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`✅ Loaded ${data.features.length} census tracts\n`);
    
    // Analyze concentration patterns
    const tracts = data.features.map(f => ({
      geoid: f.properties.geoid,
      name: f.properties.name,
      population: f.properties.population,
      diabetesCount: f.properties.diabetes_count,
      diabetesRate: f.properties.diabetes_rate,
      demographics: f.properties.demographics
    })).filter(t => t.demographics && t.demographics.totalPopulation > 100);
    
    // Calculate minority percentages and sort by diabetes count
    const tractsWithMinority = tracts.map(tract => {
      const totalPop = tract.demographics.totalPopulation;
      const blackPct = ((tract.demographics.race?.black || 0) / totalPop) * 100;
      const hispanicPct = ((tract.demographics.ethnicity?.hispanic || 0) / totalPop) * 100;
      const minorityPct = blackPct + hispanicPct;
      
      return {
        ...tract,
        blackPct,
        hispanicPct,
        minorityPct
      };
    });
    
    // Sort by diabetes count (descending)
    tractsWithMinority.sort((a, b) => b.diabetesCount - a.diabetesCount);
    
    console.log('🔴 TOP 20 HIGHEST DISEASE COUNTS (Should be High Minority Areas):');
    console.log('═'.repeat(100));
    console.log('Tract ID'.padEnd(12) + 'Count'.padEnd(8) + 'Rate'.padEnd(8) + 'Pop'.padEnd(8) + '% Black'.padEnd(8) + '% Hispanic'.padEnd(10) + '% Minority'.padEnd(10) + 'Name');
    console.log('═'.repeat(100));
    
    const topCounts = tractsWithMinority.slice(0, 20);
    topCounts.forEach(tract => {
      console.log(
        tract.geoid.padEnd(12) + 
        tract.diabetesCount.toString().padEnd(8) + 
        tract.diabetesRate.toFixed(1).padEnd(8) + 
        tract.population.toString().padEnd(8) + 
        tract.blackPct.toFixed(1).padEnd(8) + 
        tract.hispanicPct.toFixed(1).padEnd(10) + 
        tract.minorityPct.toFixed(1).padEnd(10) + 
        tract.name.substring(0, 20)
      );
    });
    
    console.log('\n🟢 TOP 20 LOWEST DISEASE COUNTS (Should be Low Minority Areas):');
    console.log('═'.repeat(100));
    console.log('Tract ID'.padEnd(12) + 'Count'.padEnd(8) + 'Rate'.padEnd(8) + 'Pop'.padEnd(8) + '% Black'.padEnd(8) + '% Hispanic'.padEnd(10) + '% Minority'.padEnd(10) + 'Name');
    console.log('═'.repeat(100));
    
    const bottomCounts = tractsWithMinority.slice(-20);
    bottomCounts.forEach(tract => {
      console.log(
        tract.geoid.padEnd(12) + 
        tract.diabetesCount.toString().padEnd(8) + 
        tract.diabetesRate.toFixed(1).padEnd(8) + 
        tract.population.toString().padEnd(8) + 
        tract.blackPct.toFixed(1).padEnd(8) + 
        tract.hispanicPct.toFixed(1).padEnd(10) + 
        tract.minorityPct.toFixed(1).padEnd(10) + 
        tract.name.substring(0, 20)
      );
    });
    
    // Calculate correlation statistics
    const avgHighCountMinority = topCounts.reduce((sum, t) => sum + t.minorityPct, 0) / topCounts.length;
    const avgLowCountMinority = bottomCounts.reduce((sum, t) => sum + t.minorityPct, 0) / bottomCounts.length;
    const avgHighCount = topCounts.reduce((sum, t) => sum + t.diabetesCount, 0) / topCounts.length;
    const avgLowCount = bottomCounts.reduce((sum, t) => sum + t.diabetesCount, 0) / bottomCounts.length;
    
    console.log('\n📊 Count Concentration Analysis:');
    console.log('═'.repeat(50));
    console.log(`High Count Areas - Avg Minority %: ${avgHighCountMinority.toFixed(1)}%`);
    console.log(`Low Count Areas - Avg Minority %: ${avgLowCountMinority.toFixed(1)}%`);
    console.log(`High Count Areas - Avg Count: ${avgHighCount.toFixed(0)}`);
    console.log(`Low Count Areas - Avg Count: ${avgLowCount.toFixed(0)}`);
    console.log(`Count Concentration Ratio: ${(avgHighCount / avgLowCount).toFixed(2)}x`);
    console.log(`Minority Correlation: ${avgHighCountMinority > avgLowCountMinority + 20 ? 'STRONG' : 'WEAK'}`);
    
    console.log(`\n✅ Count concentration test completed`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCountConcentration();
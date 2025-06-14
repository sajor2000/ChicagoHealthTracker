import fetch from 'node-fetch';

/**
 * Analyze Count vs Rate Relationship
 * Investigates why count and rate visualizations appear nearly identical
 */
async function analyzeCountRateRelationship() {
  console.log('🔍 Analyzing Count vs Rate Relationship\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No census data available');
    }
    
    // Analyze diabetes data specifically
    const diabetesAnalysis = data.features.map(f => ({
      name: f.properties.name,
      population: f.properties.population,
      diabetes_count: f.properties.diabetes_count,
      diabetes_rate: f.properties.diabetes_rate,
      calculated_rate: (f.properties.diabetes_count / f.properties.population * 1000).toFixed(1)
    })).slice(0, 10);
    
    console.log('Sample Census Tract Analysis:');
    console.log('=============================');
    diabetesAnalysis.forEach(tract => {
      console.log(`${tract.name}:`);
      console.log(`  Population: ${tract.population.toLocaleString()}`);
      console.log(`  Diabetes Count: ${tract.diabetes_count.toLocaleString()}`);
      console.log(`  Reported Rate: ${tract.diabetes_rate} per 1,000`);
      console.log(`  Calculated Rate: ${tract.calculated_rate} per 1,000`);
      console.log(`  Rate Match: ${tract.diabetes_rate == tract.calculated_rate ? 'YES' : 'NO'}`);
      console.log('');
    });
    
    // Check if count correlates too strongly with population
    const populationCountCorrelation = data.features.map(f => ({
      population: f.properties.population,
      diabetes_count: f.properties.diabetes_count,
      ratio: (f.properties.diabetes_count / f.properties.population).toFixed(3)
    }));
    
    const ratios = populationCountCorrelation.map(d => parseFloat(d.ratio));
    const avgRatio = (ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(3);
    const minRatio = Math.min(...ratios).toFixed(3);
    const maxRatio = Math.max(...ratios).toFixed(3);
    
    console.log('Population-Count Relationship Analysis:');
    console.log('======================================');
    console.log(`Average diabetes ratio: ${avgRatio} (${(avgRatio * 1000).toFixed(1)} per 1,000)`);
    console.log(`Min ratio: ${minRatio} (${(minRatio * 1000).toFixed(1)} per 1,000)`);
    console.log(`Max ratio: ${maxRatio} (${(maxRatio * 1000).toFixed(1)} per 1,000)`);
    console.log(`Ratio variation: ${((maxRatio - minRatio) / avgRatio * 100).toFixed(1)}%`);
    
    // Analyze color scale ranges
    const counts = data.features.map(f => f.properties.diabetes_count).sort((a, b) => a - b);
    const rates = data.features.map(f => f.properties.diabetes_rate).sort((a, b) => a - b);
    
    console.log('\nColor Scale Analysis:');
    console.log('====================');
    console.log('Count Distribution:');
    console.log(`  Min: ${counts[0].toLocaleString()}`);
    console.log(`  Q25: ${counts[Math.floor(counts.length * 0.25)].toLocaleString()}`);
    console.log(`  Median: ${counts[Math.floor(counts.length * 0.5)].toLocaleString()}`);
    console.log(`  Q75: ${counts[Math.floor(counts.length * 0.75)].toLocaleString()}`);
    console.log(`  Max: ${counts[counts.length - 1].toLocaleString()}`);
    console.log(`  Range Ratio: ${(counts[counts.length - 1] / counts[0]).toFixed(1)}:1`);
    
    console.log('\nRate Distribution:');
    console.log(`  Min: ${rates[0].toFixed(1)}`);
    console.log(`  Q25: ${rates[Math.floor(rates.length * 0.25)].toFixed(1)}`);
    console.log(`  Median: ${rates[Math.floor(rates.length * 0.5)].toFixed(1)}`);
    console.log(`  Q75: ${rates[Math.floor(rates.length * 0.75)].toFixed(1)}`);
    console.log(`  Max: ${rates[rates.length - 1].toFixed(1)}`);
    console.log(`  Range Ratio: ${(rates[rates.length - 1] / rates[0]).toFixed(1)}:1`);
    
    // Check if the issue is uniform disease prevalence
    if ((maxRatio - minRatio) / avgRatio < 0.5) {
      console.log('\n⚠️  ISSUE IDENTIFIED:');
      console.log('   Disease prevalence ratios are too uniform across census tracts');
      console.log('   This suggests synthetic data generation rather than real health disparities');
      console.log('   Real health data should show 2-5x variation between areas');
    }
    
    // Recommendation
    console.log('\n💡 RECOMMENDATIONS:');
    if (ratios.every(r => Math.abs(r - avgRatio) < avgRatio * 0.2)) {
      console.log('   - Count and rate are nearly identical because disease prevalence is uniform');
      console.log('   - Need to implement realistic health disparity patterns');
      console.log('   - South/west areas should have 2-3x higher disease rates than north areas');
    } else {
      console.log('   - Count and rate should show different patterns due to population density');
      console.log('   - Count should highlight high-population areas');
      console.log('   - Rate should highlight areas with high disease prevalence regardless of population');
    }
    
  } catch (error) {
    console.error('Analysis failed:', error.message);
  }
}

analyzeCountRateRelationship();
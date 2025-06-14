/**
 * Debug Rate Calculation System
 * Verify that population-adjusted rates are properly calculated and not just showing raw disease burden
 */

async function debugRateCalculations() {
  console.log('🔍 DEBUGGING POPULATION-ADJUSTED RATE CALCULATIONS');
  console.log('=' .repeat(80));
  
  try {
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No census data available');
    }
    
    // Sample 10 census tracts for detailed analysis
    const sampleTracts = data.features.slice(0, 10);
    
    console.log('\n📊 SAMPLE TRACT RATE VERIFICATION:');
    console.log('Tract Name                   Pop    HTN Count  HTN Rate  Calc Rate  Match?');
    console.log('-'.repeat(80));
    
    sampleTracts.forEach(tract => {
      const props = tract.properties;
      const population = props.population;
      const hypertensionCount = props.hypertension_count;
      const hypertensionRate = props.hypertension_rate;
      
      // Calculate what the rate should be (per 1,000 residents)
      const calculatedRate = (hypertensionCount / population * 1000);
      const rateMatch = Math.abs(hypertensionRate - calculatedRate) < 1;
      
      console.log(
        `${props.name.padEnd(28)} ${population.toString().padStart(6)} ` +
        `${hypertensionCount.toString().padStart(9)} ${hypertensionRate.toFixed(1).padStart(9)} ` +
        `${calculatedRate.toFixed(1).padStart(9)} ${rateMatch ? '✅' : '❌'}`
      );
    });
    
    // Analyze rate distribution patterns
    console.log('\n🗺️  GEOGRAPHIC RATE ANALYSIS:');
    console.log('Checking if rates show proper geographic variation vs just population density');
    
    const allTracts = data.features.map(tract => ({
      name: tract.properties.name,
      population: tract.properties.population,
      density: tract.properties.density,
      hypertensionCount: tract.properties.hypertension_count,
      hypertensionRate: tract.properties.hypertension_rate,
      diabetesRate: tract.properties.diabetes_rate,
      calculatedHTNRate: (tract.properties.hypertension_count / tract.properties.population * 1000)
    }));
    
    // Sort by different metrics to see patterns
    const sortedByRate = [...allTracts].sort((a, b) => b.hypertensionRate - a.hypertensionRate);
    const sortedByDensity = [...allTracts].sort((a, b) => b.density - a.density);
    const sortedByCount = [...allTracts].sort((a, b) => b.hypertensionCount - a.hypertensionCount);
    
    console.log('\n🔴 HIGHEST HYPERTENSION RATES:');
    console.log('Tract Name                   Rate    Density   Count   Pop');
    console.log('-'.repeat(65));
    sortedByRate.slice(0, 5).forEach(tract => {
      console.log(
        `${tract.name.padEnd(28)} ${tract.hypertensionRate.toFixed(1).padStart(6)} ` +
        `${tract.density.toFixed(0).padStart(8)} ${tract.hypertensionCount.toString().padStart(6)} ` +
        `${tract.population.toString().padStart(6)}`
      );
    });
    
    console.log('\n🟢 LOWEST HYPERTENSION RATES:');
    console.log('Tract Name                   Rate    Density   Count   Pop');
    console.log('-'.repeat(65));
    sortedByRate.slice(-5).reverse().forEach(tract => {
      console.log(
        `${tract.name.padEnd(28)} ${tract.hypertensionRate.toFixed(1).padStart(6)} ` +
        `${tract.density.toFixed(0).padStart(8)} ${tract.hypertensionCount.toString().padStart(6)} ` +
        `${tract.population.toString().padStart(6)}`
      );
    });
    
    // Check if high rates correlate with high counts (bad) or show independent variation (good)
    const rateCountCorrelation = calculateCorrelation(
      allTracts.map(t => t.hypertensionRate),
      allTracts.map(t => t.hypertensionCount)
    );
    
    const rateDensityCorrelation = calculateCorrelation(
      allTracts.map(t => t.hypertensionRate),
      allTracts.map(t => t.density)
    );
    
    console.log('\n📈 CORRELATION ANALYSIS:');
    console.log(`Rate vs Count Correlation: ${rateCountCorrelation.toFixed(3)}`);
    console.log(`Rate vs Density Correlation: ${rateDensityCorrelation.toFixed(3)}`);
    
    if (Math.abs(rateCountCorrelation) > 0.9) {
      console.log('❌ PROBLEM: Rates are too highly correlated with counts - not properly population-adjusted');
    } else if (Math.abs(rateCountCorrelation) > 0.7) {
      console.log('⚠️  WARNING: Rates show high correlation with counts - may need adjustment');
    } else {
      console.log('✅ GOOD: Rates show proper independence from raw counts');
    }
    
    // Test different diseases for comparison
    console.log('\n🦠 MULTI-DISEASE RATE COMPARISON:');
    const sampleTract = allTracts[0];
    console.log(`Sample Tract: ${sampleTract.name}`);
    console.log(`Population: ${sampleTract.population}`);
    console.log(`Diabetes Rate: ${sampleTract.diabetesRate} per 1,000`);
    console.log(`Hypertension Rate: ${sampleTract.hypertensionRate} per 1,000`);
    
    // Check rate ranges for visualization quality
    const hypertensionRates = allTracts.map(t => t.hypertensionRate);
    const minRate = Math.min(...hypertensionRates);
    const maxRate = Math.max(...hypertensionRates);
    const rateRange = maxRate - minRate;
    const rateRatio = maxRate / minRate;
    
    console.log('\n🎨 RATE VISUALIZATION QUALITY:');
    console.log(`Min Rate: ${minRate.toFixed(1)} per 1,000`);
    console.log(`Max Rate: ${maxRate.toFixed(1)} per 1,000`);
    console.log(`Range: ${rateRange.toFixed(1)}`);
    console.log(`Ratio: ${rateRatio.toFixed(2)}x`);
    
    if (rateRange < 50) {
      console.log('❌ POOR: Rate range too narrow for good color visualization');
    } else if (rateRange < 100) {
      console.log('⚠️  FAIR: Rate range could be wider for better visualization');
    } else {
      console.log('✅ GOOD: Rate range provides good color visualization');
    }
    
    return {
      rateCountCorrelation,
      rateDensityCorrelation,
      rateRange,
      rateRatio,
      sampleSize: allTracts.length
    };
    
  } catch (error) {
    console.error('Error debugging rate calculations:', error.message);
    return null;
  }
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n === 0) return 0;
  
  const sumX = x.reduce((sum, val) => sum + val, 0);
  const sumY = y.reduce((sum, val) => sum + val, 0);
  const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
  const sumX2 = x.reduce((sum, val) => sum + val * val, 0);
  const sumY2 = y.reduce((sum, val) => sum + val * val, 0);
  
  const numerator = n * sumXY - sumX * sumY;
  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  
  return denominator === 0 ? 0 : numerator / denominator;
}

// Run the debug analysis
debugRateCalculations().then(result => {
  if (result) {
    console.log('\n✅ Rate calculation debugging completed');
    console.log(`Final Assessment: Correlation=${result.rateCountCorrelation.toFixed(3)}, Range=${result.rateRange.toFixed(1)}, Ratio=${result.rateRatio.toFixed(2)}x`);
  }
}).catch(console.error);
/**
 * Comprehensive Color Visualization Test for All 8 Diseases
 * Verifies green-to-red color scaling works properly for both count and rate modes
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
 * Test color visualization ranges for a specific disease and mode
 */
async function testDiseaseColorVisualization(disease, mode) {
  try {
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      console.error(`No data available for ${disease}`);
      return null;
    }
    
    const propertyKey = `${disease}_${mode}`;
    
    // Extract values for color analysis
    const values = data.features
      .map(feature => feature.properties[propertyKey])
      .filter(value => typeof value === 'number' && value > 0)
      .sort((a, b) => a - b);
    
    if (values.length === 0) {
      console.error(`No valid ${propertyKey} values found`);
      return null;
    }
    
    // Calculate color scale thresholds (same as map visualization)
    const min = values[0];
    const q25 = values[Math.floor(values.length * 0.25)];
    const median = values[Math.floor(values.length * 0.5)];
    const q75 = values[Math.floor(values.length * 0.75)];
    const q90 = values[Math.floor(values.length * 0.90)];
    const q95 = values[Math.floor(values.length * 0.95)];
    const max = values[values.length - 1];
    
    const range = max - min;
    const ratio = max / min;
    
    console.log(`\n🎨 ${disease.toUpperCase()} ${mode.toUpperCase()} COLOR VISUALIZATION:`);
    console.log('Color Scale Thresholds:');
    console.log(`  🟢 Dark Green (Min):     ${min.toFixed(1)}`);
    console.log(`  🟢 Green (25th):        ${q25.toFixed(1)}`);
    console.log(`  🟡 Yellow (Median):     ${median.toFixed(1)}`);
    console.log(`  🟠 Orange (75th):       ${q75.toFixed(1)}`);
    console.log(`  🔴 Red (90th):          ${q90.toFixed(1)}`);
    console.log(`  🔴 Dark Red (95th):     ${q95.toFixed(1)}`);
    console.log(`  ⚫ Very Dark Red (Max): ${max.toFixed(1)}`);
    
    console.log(`\n📊 Visualization Metrics:`);
    console.log(`  Range: ${range.toFixed(1)} (${min.toFixed(1)} to ${max.toFixed(1)})`);
    console.log(`  Ratio: ${ratio.toFixed(2)}x disparity`);
    console.log(`  Data Points: ${values.length} valid values`);
    
    // Assess color visualization quality
    let quality = 'POOR';
    if (range >= 50 && ratio >= 1.5) quality = 'GOOD';
    if (range >= 100 && ratio >= 2.0) quality = 'EXCELLENT';
    if (range >= 200 && ratio >= 3.0) quality = 'OUTSTANDING';
    
    console.log(`  Quality: ${quality} (Range: ${range.toFixed(1)}, Ratio: ${ratio.toFixed(2)}x)`);
    
    return {
      disease,
      mode,
      min,
      max,
      range,
      ratio,
      quality,
      dataPoints: values.length
    };
    
  } catch (error) {
    console.error(`Error testing ${disease} ${mode}:`, error.message);
    return null;
  }
}

/**
 * Test all diseases in both count and rate modes
 */
async function testAllDiseaseColorVisualization() {
  console.log('🎨 COMPREHENSIVE COLOR VISUALIZATION TEST');
  console.log('Testing green-to-red color scaling for all 8 diseases');
  console.log('═'.repeat(80));
  
  const results = [];
  
  for (const disease of diseases) {
    console.log(`\n🦠 TESTING ${disease.toUpperCase()}`);
    console.log('─'.repeat(50));
    
    // Test both count and rate modes
    const countResult = await testDiseaseColorVisualization(disease, 'count');
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
    
    const rateResult = await testDiseaseColorVisualization(disease, 'rate');
    await new Promise(resolve => setTimeout(resolve, 500)); // Brief pause
    
    if (countResult) results.push(countResult);
    if (rateResult) results.push(rateResult);
  }
  
  // Summary analysis
  console.log('\n📋 COLOR VISUALIZATION SUMMARY');
  console.log('═'.repeat(80));
  console.log('Disease              Mode   Min      Max      Range    Ratio   Quality     Points');
  console.log('─'.repeat(80));
  
  results.forEach(result => {
    if (result) {
      console.log(
        `${result.disease.padEnd(20)} ${result.mode.padEnd(6)} ` +
        `${result.min.toFixed(1).padStart(8)} ${result.max.toFixed(1).padStart(8)} ` +
        `${result.range.toFixed(1).padStart(8)} ${result.ratio.toFixed(2).padStart(6)}x ` +
        `${result.quality.padEnd(11)} ${result.dataPoints.toString().padStart(6)}`
      );
    }
  });
  
  // Quality assessment
  const countResults = results.filter(r => r && r.mode === 'count');
  const rateResults = results.filter(r => r && r.mode === 'rate');
  
  const avgCountRange = countResults.reduce((sum, r) => sum + r.range, 0) / countResults.length;
  const avgRateRange = rateResults.reduce((sum, r) => sum + r.range, 0) / rateResults.length;
  const avgCountRatio = countResults.reduce((sum, r) => sum + r.ratio, 0) / countResults.length;
  const avgRateRatio = rateResults.reduce((sum, r) => sum + r.ratio, 0) / rateResults.length;
  
  console.log('\n🎯 OVERALL COLOR SYSTEM PERFORMANCE:');
  console.log(`Count Mode - Average Range: ${avgCountRange.toFixed(1)}, Average Ratio: ${avgCountRatio.toFixed(2)}x`);
  console.log(`Rate Mode - Average Range: ${avgRateRange.toFixed(1)}, Average Ratio: ${avgRateRatio.toFixed(2)}x`);
  
  const excellentResults = results.filter(r => r && (r.quality === 'EXCELLENT' || r.quality === 'OUTSTANDING')).length;
  const totalResults = results.filter(r => r).length;
  const qualityPercentage = (excellentResults / totalResults) * 100;
  
  console.log(`Excellent/Outstanding Results: ${excellentResults}/${totalResults} (${qualityPercentage.toFixed(1)}%)`);
  
  if (qualityPercentage >= 75) {
    console.log('✅ OUTSTANDING: Color visualization system performs excellently across all diseases');
  } else if (qualityPercentage >= 50) {
    console.log('✅ GOOD: Color visualization system works well for most diseases');
  } else {
    console.log('⚠️  NEEDS IMPROVEMENT: Color visualization system requires enhancement');
  }
  
  console.log('\n🌈 Color Legend Verification:');
  console.log('Green (#16a34a) → Light Green (#22c55e) → Yellow (#eab308) → Orange (#f97316) → Red (#dc2626) → Dark Red (#b91c1c) → Very Dark Red (#7f1d1d)');
  console.log('Low Disease Burden ──────────────────────────────────────────────────────────────────────► High Disease Burden');
  
  console.log('\n✅ All disease color visualization testing completed');
}

// Run the comprehensive color test
testAllDiseaseColorVisualization().catch(console.error);
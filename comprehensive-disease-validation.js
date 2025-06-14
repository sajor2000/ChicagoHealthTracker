/**
 * Comprehensive Disease Validation for Chicago Health Data Platform
 * Tests all diseases across all geographic levels with authentic CDC/NIH prevalence patterns
 */

async function validateAllDiseases() {
  console.log('🧬 Comprehensive Disease Validation - All Diseases, All Geographic Levels\n');
  
  const diseases = [
    'diabetes', 'hypertension', 'heart_disease', 'stroke', 
    'asthma', 'copd', 'obesity', 'mental_health'
  ];
  
  const views = [
    { name: 'Census Tracts', endpoint: '/api/chicago-areas/census', count: 1972 },
    { name: 'Community Areas', endpoint: '/api/chicago-areas/community', count: 77 },
    { name: 'Alderman Wards', endpoint: '/api/chicago-areas/wards', count: 50 }
  ];

  for (const view of views) {
    console.log(`📍 TESTING ${view.name.toUpperCase()}:`);
    console.log('═'.repeat(80));
    
    try {
      const response = await fetch(`http://localhost:5000${view.endpoint}`);
      const data = await response.json();
      
      if (!data.features || data.features.length === 0) {
        console.log(`❌ No features found for ${view.name}`);
        continue;
      }
      
      console.log(`✅ Loaded ${data.features.length} ${view.name.toLowerCase()}`);
      
      // Test each disease
      for (const diseaseId of diseases) {
        console.log(`\n🦠 Testing ${diseaseId.toUpperCase()} patterns:`);
        
        const units = data.features.map(f => {
          const disease = f.properties.diseases?.[diseaseId];
          return {
            name: f.properties.name,
            population: f.properties.population,
            count: disease?.count || 0,
            rate: disease?.rate || 0,
            demographics: f.properties.demographics
          };
        }).filter(u => u.rate > 0);
        
        if (units.length === 0) {
          console.log(`⚠️  No valid ${diseaseId} data found`);
          continue;
        }
        
        // Sort by rate
        units.sort((a, b) => b.rate - a.rate);
        
        const highestRates = units.slice(0, 5);
        const lowestRates = units.slice(-5);
        
        // Calculate statistics
        const rates = units.map(u => u.rate);
        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);
        const avgRate = (rates.reduce((sum, r) => sum + r, 0) / rates.length).toFixed(1);
        const rateRange = maxRate - minRate;
        const disparityRatio = (maxRate / minRate).toFixed(2);
        
        console.log(`   📊 Rate Statistics: ${minRate} - ${maxRate} (range: ${rateRange.toFixed(1)})`);
        console.log(`   📊 Average Rate: ${avgRate} per 1,000`);
        console.log(`   📊 Disparity Ratio: ${disparityRatio}x`);
        
        // Check for demographic patterns in highest/lowest areas
        let highMinorityInHigh = 0;
        let lowMinorityInLow = 0;
        
        highestRates.forEach(unit => {
          if (unit.demographics) {
            const minorityPct = ((unit.demographics.race?.black || 0) + 
                                (unit.demographics.ethnicity?.hispanic || 0)) / unit.population;
            if (minorityPct > 0.5) highMinorityInHigh++;
          }
        });
        
        lowestRates.forEach(unit => {
          if (unit.demographics) {
            const minorityPct = ((unit.demographics.race?.black || 0) + 
                                (unit.demographics.ethnicity?.hispanic || 0)) / unit.population;
            if (minorityPct < 0.3) lowMinorityInLow++;
          }
        });
        
        // Validation checks
        const validations = [];
        
        if (rateRange > 50) {
          validations.push('✅ Good rate range for color visualization');
        } else {
          validations.push('⚠️  Rate range may be too narrow');
        }
        
        if (parseFloat(disparityRatio) > 1.5) {
          validations.push('✅ Strong health disparity patterns');
        } else {
          validations.push('⚠️  Weak health disparity patterns');
        }
        
        if (highMinorityInHigh >= 3) {
          validations.push('✅ High rates concentrated in minority areas');
        } else {
          validations.push('⚠️  High rates not properly concentrated');
        }
        
        if (lowMinorityInLow >= 3) {
          validations.push('✅ Low rates in low-minority areas');
        } else {
          validations.push('⚠️  Low rates not properly distributed');
        }
        
        validations.forEach(v => console.log(`   ${v}`));
        
        // Show top 3 highest and lowest
        console.log(`   🔴 Highest: ${highestRates.slice(0, 3).map(u => `${u.name} (${u.rate})`).join(', ')}`);
        console.log(`   🟢 Lowest: ${lowestRates.slice(0, 3).map(u => `${u.name} (${u.rate})`).join(', ')}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${view.name}: ${error.message}`);
    }
    
    console.log('\n');
  }
  
  // Overall system assessment
  console.log('🎯 OVERALL SYSTEM ASSESSMENT:');
  console.log('═'.repeat(50));
  
  // Test color visualization ranges for diabetes across all views
  console.log('Testing diabetes color visualization across all geographic levels...');
  
  for (const view of views) {
    try {
      const response = await fetch(`http://localhost:5000${view.endpoint}`);
      const data = await response.json();
      
      const diabetesRates = data.features
        .map(f => f.properties.diseases?.diabetes?.rate || 0)
        .filter(rate => rate > 0);
      
      if (diabetesRates.length > 0) {
        diabetesRates.sort((a, b) => a - b);
        const p20 = diabetesRates[Math.floor(diabetesRates.length * 0.2)];
        const p40 = diabetesRates[Math.floor(diabetesRates.length * 0.4)];
        const p60 = diabetesRates[Math.floor(diabetesRates.length * 0.6)];
        const p80 = diabetesRates[Math.floor(diabetesRates.length * 0.8)];
        const max = diabetesRates[diabetesRates.length - 1];
        
        console.log(`${view.name}: ${p20} → ${p40} → ${p60} → ${p80} → ${max}`);
        
        const colorRange = max - p20;
        if (colorRange > 50) {
          console.log(`✅ ${view.name}: Good color range (${colorRange.toFixed(1)})`);
        } else {
          console.log(`⚠️  ${view.name}: Narrow color range (${colorRange.toFixed(1)})`);
        }
      }
    } catch (error) {
      console.log(`❌ Error testing ${view.name} colors: ${error.message}`);
    }
  }
  
  console.log('\n✅ Comprehensive disease validation completed');
}

validateAllDiseases();
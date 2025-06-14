import fetch from 'node-fetch';

async function testVisualDisparityPatterns() {
  console.log('Testing Visual Health Disparity Color Patterns\n');
  
  try {
    // Test community areas for proper south/west high-risk patterns
    const response = await fetch('http://localhost:5000/api/chicago-areas/community');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No community area data available');
    }
    
    // Analyze diabetes rates for color mapping validation
    const diabetesRates = data.features
      .map(f => ({
        name: f.properties.name,
        id: f.properties.id,
        rate: f.properties.diabetes_rate,
        count: f.properties.diabetes_count,
        population: f.properties.population
      }))
      .filter(area => area.rate > 0)
      .sort((a, b) => b.rate - a.rate);
    
    console.log('Diabetes Rate Analysis for Color Mapping:');
    console.log('=========================================');
    
    // Quartile analysis for color zones
    const q75Index = Math.floor(diabetesRates.length * 0.25);
    const medianIndex = Math.floor(diabetesRates.length * 0.5);
    const q25Index = Math.floor(diabetesRates.length * 0.75);
    
    const redZone = diabetesRates.slice(0, q75Index);  // Top 25% - RED
    const yellowZone = diabetesRates.slice(q75Index, medianIndex); // 25-50% - YELLOW/ORANGE
    const lightZone = diabetesRates.slice(medianIndex, q25Index); // 50-75% - LIGHT YELLOW
    const greenZone = diabetesRates.slice(q25Index); // Bottom 25% - GREEN
    
    console.log('RED ZONES (Highest Risk):');
    redZone.forEach((area, i) => {
      console.log(`  ${i+1}. ${area.name}: ${area.rate.toFixed(1)} per 1,000`);
    });
    
    console.log('\nYELLOW/ORANGE ZONES (High-Medium Risk):');
    yellowZone.slice(0, 5).forEach((area, i) => {
      console.log(`  ${i+1}. ${area.name}: ${area.rate.toFixed(1)} per 1,000`);
    });
    
    console.log('\nGREEN ZONES (Lowest Risk):');
    greenZone.slice(-5).forEach((area, i) => {
      console.log(`  ${i+1}. ${area.name}: ${area.rate.toFixed(1)} per 1,000`);
    });
    
    // Verify south/west Chicago pattern in red zones
    const southWestAreas = redZone.filter(area => {
      const name = area.name.toLowerCase();
      return name.includes('south') || 
             name.includes('west') ||
             name.includes('englewood') ||
             name.includes('austin') ||
             name.includes('garfield') ||
             name.includes('washington') ||
             name.includes('roseland') ||
             name.includes('avalon') ||
             name.includes('chatham') ||
             name.includes('greater grand crossing') ||
             name.includes('bronzeville') ||
             name.includes('douglas');
    });
    
    console.log(`\nSOUTH/WEST PATTERN VALIDATION:`);
    console.log(`Red zone areas with south/west pattern: ${southWestAreas.length}/${redZone.length}`);
    console.log(`South/West high-risk areas: ${southWestAreas.map(a => a.name).join(', ')}`);
    
    // Test ward-level patterns
    console.log('\n' + '='.repeat(50));
    console.log('Ward-Level Disparity Analysis:');
    
    const wardResponse = await fetch('http://localhost:5000/api/chicago-areas/wards');
    const wardData = await wardResponse.json();
    
    const wardRates = wardData.features
      .map(f => ({
        name: f.properties.name,
        number: f.properties.ward_number || f.properties.name.match(/\d+/)?.[0],
        rate: f.properties.diabetes_rate,
        population: f.properties.population
      }))
      .filter(ward => ward.rate > 0)
      .sort((a, b) => b.rate - a.rate);
    
    const highRiskWards = wardRates.slice(0, Math.floor(wardRates.length * 0.3));
    
    console.log('HIGH-RISK WARDS (Red Zones):');
    highRiskWards.forEach((ward, i) => {
      console.log(`  ${i+1}. ${ward.name}: ${ward.rate.toFixed(1)} per 1,000`);
    });
    
    // Check for expected south side ward numbers (6, 7, 8, 9, 15, 16, 17, 20, 21)
    const southSideWards = highRiskWards.filter(ward => {
      const num = parseInt(ward.number);
      return [6, 7, 8, 9, 15, 16, 17, 20, 21, 34].includes(num);
    });
    
    console.log(`\nSOUTH SIDE WARD PATTERN:`);
    console.log(`High-risk south side wards: ${southSideWards.length}/${highRiskWards.length}`);
    console.log(`South side wards in red zone: ${southSideWards.map(w => w.name).join(', ')}`);
    
    // Color scale validation
    console.log('\n' + '='.repeat(50));
    console.log('COLOR SCALE VALIDATION:');
    
    const maxRate = diabetesRates[0].rate;
    const minRate = diabetesRates[diabetesRates.length - 1].rate;
    const q75Rate = diabetesRates[q75Index].rate;
    const medianRate = diabetesRates[medianIndex].rate;
    const q25Rate = diabetesRates[q25Index].rate;
    
    console.log(`Rate Distribution for Color Mapping:`);
    console.log(`  Maximum (Deep Red): ${maxRate.toFixed(1)} per 1,000`);
    console.log(`  75th %tile (Red): ${q75Rate.toFixed(1)} per 1,000`);
    console.log(`  Median (Yellow): ${medianRate.toFixed(1)} per 1,000`);
    console.log(`  25th %tile (Lt Green): ${q25Rate.toFixed(1)} per 1,000`);
    console.log(`  Minimum (Green): ${minRate.toFixed(1)} per 1,000`);
    console.log(`  Disparity Ratio: ${(maxRate/minRate).toFixed(1)}:1`);
    
    // Validation summary
    const validationScore = {
      southWestInRed: southWestAreas.length >= 3,
      southWardsInRed: southSideWards.length >= 2,
      strongDisparity: (maxRate/minRate) >= 3.0,
      properRange: maxRate > 150 && minRate < 100
    };
    
    const passedTests = Object.values(validationScore).filter(Boolean).length;
    
    console.log('\n' + '='.repeat(50));
    console.log('VISUAL DISPARITY VALIDATION RESULTS:');
    console.log(`South/West Areas in Red Zone: ${validationScore.southWestInRed ? 'PASS' : 'FAIL'}`);
    console.log(`South Side Wards in Red Zone: ${validationScore.southWardsInRed ? 'PASS' : 'FAIL'}`);
    console.log(`Strong Health Disparities: ${validationScore.strongDisparity ? 'PASS' : 'FAIL'}`);
    console.log(`Realistic Rate Ranges: ${validationScore.properRange ? 'PASS' : 'FAIL'}`);
    console.log(`Overall Score: ${passedTests}/4 tests passed`);
    
    if (passedTests >= 3) {
      console.log('\nSUCCESS: Health disparity visualization patterns are correctly configured');
      console.log('Red zones properly represent high-risk south/west Chicago areas');
    } else {
      console.log('\nWARNING: Health disparity patterns may need adjustment');
    }
    
  } catch (error) {
    console.error('Visual disparity test failed:', error.message);
    process.exit(1);
  }
}

testVisualDisparityPatterns();
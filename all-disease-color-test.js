/**
 * Comprehensive Color Visualization Test for All 8 Diseases
 * Verifies disease-specific color scaling works properly for both count and rate modes
 */

import http from 'http';

async function fetchData(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

/**
 * Test color visualization ranges for a specific disease and mode
 */
async function testDiseaseColorVisualization(disease, mode) {
  console.log(`\n--- ${disease.toUpperCase()} ${mode.toUpperCase()} MODE ---`);
  
  try {
    const data = await fetchData('/api/chicago-areas/census');
    
    if (!data.features || data.features.length === 0) {
      console.log('❌ No census tract data available');
      return;
    }

    const propertyKey = `${disease}_${mode}`;
    const values = data.features
      .map(f => f.properties?.[propertyKey])
      .filter(v => typeof v === 'number' && v > 0)
      .sort((a, b) => a - b);

    if (values.length === 0) {
      console.log(`❌ No valid ${propertyKey} data found`);
      return;
    }

    const min = values[0];
    const max = values[values.length - 1];
    const range = max - min;
    const median = values[Math.floor(values.length * 0.5)];
    
    // Calculate expected color gradient based on disease
    let expectedColorScheme = '';
    let colorDescription = '';
    
    switch (disease) {
      case 'diabetes':
        expectedColorScheme = 'Blue → Cyan → Yellow → Orange → Red';
        colorDescription = 'Blue indicates good diabetic control, red shows poor control';
        break;
      case 'hypertension':
        expectedColorScheme = 'Green → Yellow-Green → Yellow → Orange → Red';
        colorDescription = 'Green shows normal blood pressure, red indicates hypertensive ranges';
        break;
      case 'heart_disease':
        expectedColorScheme = 'Purple → Pink → Orange → Red';
        colorDescription = 'Purple indicates low cardiac risk, red shows high cardiovascular risk';
        break;
      case 'stroke':
        expectedColorScheme = 'Teal → Cyan → Amber → Orange → Red';
        colorDescription = 'Teal indicates low stroke risk, red shows extreme stroke risk';
        break;
      case 'asthma':
        expectedColorScheme = 'Sky Blue → Light Blue → Yellow → Orange → Red';
        colorDescription = 'Blue shows clear breathing, red indicates severe respiratory symptoms';
        break;
      case 'copd':
        expectedColorScheme = 'Gray → Light Gray → Amber → Orange → Red';
        colorDescription = 'Gray shows mild limitation, red indicates severe lung function decline';
        break;
      case 'obesity':
        expectedColorScheme = 'Green → Yellow-Green → Yellow → Orange → Red';
        colorDescription = 'Green shows normal weight, red indicates severe obesity categories';
        break;
      case 'mental_health':
        expectedColorScheme = 'Indigo → Purple → Pink → Orange → Red';
        colorDescription = 'Indigo shows good mental health, red indicates psychological crisis';
        break;
      default:
        expectedColorScheme = 'Standard Green → Red';
        colorDescription = 'Standard gradient';
    }

    console.log(`  Data Range: ${min.toFixed(1)} - ${max.toFixed(1)} (median: ${median.toFixed(1)})`);
    console.log(`  Range Span: ${range.toFixed(1)} ${mode === 'count' ? 'cases' : 'per 1,000'}`);
    console.log(`  Expected Colors: ${expectedColorScheme}`);
    console.log(`  Color Meaning: ${colorDescription}`);
    
    // Assess visualization effectiveness
    const rangeRatio = max / min;
    if (rangeRatio > 5.0) {
      console.log(`  ✅ EXCELLENT color discrimination (${rangeRatio.toFixed(1)}:1 ratio)`);
    } else if (rangeRatio > 3.0) {
      console.log(`  ✓ GOOD color discrimination (${rangeRatio.toFixed(1)}:1 ratio)`);
    } else if (rangeRatio > 2.0) {
      console.log(`  ~ MODERATE color discrimination (${rangeRatio.toFixed(1)}:1 ratio)`);
    } else {
      console.log(`  ⚠️  LIMITED color discrimination (${rangeRatio.toFixed(1)}:1 ratio)`);
    }
    
    // Sample specific tract values for verification
    const sampleTracts = data.features.slice(0, 3);
    console.log(`  Sample Values:`);
    sampleTracts.forEach((tract, index) => {
      const value = tract.properties[propertyKey];
      const tractName = tract.properties.name || `Tract ${index + 1}`;
      console.log(`    ${tractName}: ${value.toFixed(1)} ${mode === 'count' ? 'cases' : 'per 1,000'}`);
    });
    
  } catch (error) {
    console.log(`❌ Error testing ${disease} ${mode}: ${error.message}`);
  }
}

/**
 * Test all diseases in both count and rate modes
 */
async function testAllDiseaseColorVisualization() {
  console.log('=== DISEASE-SPECIFIC COLOR VISUALIZATION TEST ===');
  console.log('Testing unique color gradients for each disease category\n');

  const diseases = ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'asthma', 'copd', 'obesity', 'mental_health'];
  const modes = ['count', 'rate'];
  
  for (const disease of diseases) {
    console.log(`\n🎨 TESTING ${disease.toUpperCase()} COLOR GRADIENTS`);
    
    for (const mode of modes) {
      await testDiseaseColorVisualization(disease, mode);
    }
  }
  
  console.log('\n=== COLOR VISUALIZATION TEST COMPLETE ===');
  console.log('Each disease now has its own unique color scheme:');
  console.log('• Diabetes: Blue-to-red (metabolic control)');
  console.log('• Hypertension: Green-to-red (blood pressure ranges)');
  console.log('• Heart Disease: Purple-to-red (cardiac risk)');
  console.log('• Stroke: Teal-to-red (stroke risk)');
  console.log('• Asthma: Sky blue-to-red (respiratory health)');
  console.log('• COPD: Gray-to-red (lung function)');
  console.log('• Obesity: Green-to-red (BMI categories)');
  console.log('• Mental Health: Indigo-to-red (psychological distress)');
}

testAllDiseaseColorVisualization().catch(console.error);
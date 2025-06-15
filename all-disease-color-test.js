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
  const data = await fetchData('/api/chicago-areas/census');
  
  if (!data.features || data.features.length === 0) {
    console.log(`❌ No data for ${disease}`);
    return;
  }

  const values = [];
  data.features.forEach(feature => {
    const value = feature.properties[`${disease}_${mode}`];
    if (value && typeof value === 'number') {
      values.push(value);
    }
  });

  if (values.length === 0) {
    console.log(`❌ No ${mode} data for ${disease}`);
    return;
  }

  values.sort((a, b) => a - b);
  
  const min = values[0];
  const max = values[values.length - 1];
  const median = values[Math.floor(values.length * 0.5)];
  const q1 = values[Math.floor(values.length * 0.25)];
  const q3 = values[Math.floor(values.length * 0.75)];
  const p90 = values[Math.floor(values.length * 0.9)];
  
  const range = max - min;
  const diversity = max / min;
  
  // Count unique values to assess color distribution
  const uniqueValues = [...new Set(values)].length;
  const duplicateRate = 1 - (uniqueValues / values.length);
  
  console.log(`--- ${disease.toUpperCase()} ${mode.toUpperCase()} ---`);
  console.log(`  Range: ${min.toFixed(1)} → ${max.toFixed(1)} (${range.toFixed(1)} spread)`);
  console.log(`  Quartiles: Q1=${q1.toFixed(1)}, Median=${median.toFixed(1)}, Q3=${q3.toFixed(1)}`);
  console.log(`  90th percentile: ${p90.toFixed(1)}`);
  console.log(`  Diversity ratio: ${diversity.toFixed(2)}:1`);
  console.log(`  Unique values: ${uniqueValues}/${values.length} (${(duplicateRate*100).toFixed(1)}% clustering)`);
  
  // Color scaling assessment
  if (diversity < 1.5) {
    console.log(`  🔴 POOR color scaling - values too similar`);
  } else if (diversity < 2.5) {
    console.log(`  🟡 LIMITED color scaling - moderate variation`);
  } else if (diversity < 4.0) {
    console.log(`  🟢 GOOD color scaling - solid variation`);
  } else {
    console.log(`  ✅ EXCELLENT color scaling - high variation`);
  }
  
  // Clustering assessment
  if (duplicateRate > 0.5) {
    console.log(`  🔴 HIGH clustering - many identical values`);
  } else if (duplicateRate > 0.2) {
    console.log(`  🟡 MODERATE clustering - some repeated values`);
  } else {
    console.log(`  🟢 LOW clustering - good value distribution`);
  }
  
  console.log('');
}

/**
 * Test all diseases in both count and rate modes
 */
async function testAllDiseaseColorVisualization() {
  console.log('=== COMPREHENSIVE COLOR VISUALIZATION TEST ===\n');
  
  const diseases = [
    'diabetes', 'hypertension', 'heart_disease', 'stroke', 
    'asthma', 'copd', 'obesity', 'mental_health'
  ];
  
  const modes = ['count', 'rate'];
  
  try {
    for (const disease of diseases) {
      for (const mode of modes) {
        await testDiseaseColorVisualization(disease, mode);
      }
    }
    
    console.log('=== COLOR VISUALIZATION SUMMARY ===');
    console.log('For optimal map visualization:');
    console.log('• Diversity ratio should be >2.5:1 (preferably >4:1)');
    console.log('• Clustering should be <20% (preferably <10%)');
    console.log('• Values should span the full epidemiological range');
    console.log('• Each disease should show distinct geographic patterns');
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testAllDiseaseColorVisualization().catch(console.error);
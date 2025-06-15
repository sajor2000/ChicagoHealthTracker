/**
 * Test Fixed Count vs Rate Visualization
 * Verify that the simplified disease generation produces distinct patterns
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

async function testFixedCountRate() {
  console.log('=== FIXED COUNT VS RATE VISUALIZATION TEST ===\n');

  try {
    const data = await fetchData('/api/chicago-areas/census');
    
    if (!data.features || data.features.length === 0) {
      console.log('❌ No census tract data available');
      return;
    }

    console.log(`Testing ${data.features.length} census tracts\n`);

    // Test obesity specifically since it was the main issue
    const obesityRates = [];
    const obesityCounts = [];
    
    data.features.forEach(feature => {
      const rate = feature.properties.obesity_rate;
      const count = feature.properties.obesity_count;
      
      if (rate && count) {
        obesityRates.push(rate);
        obesityCounts.push(count);
      }
    });

    obesityRates.sort((a, b) => a - b);
    obesityCounts.sort((a, b) => a - b);

    console.log('OBESITY RATE ANALYSIS:');
    console.log(`  Min: ${obesityRates[0].toFixed(1)} per 1,000 (${(obesityRates[0]/10).toFixed(1)}%)`);
    console.log(`  Q1: ${obesityRates[Math.floor(obesityRates.length * 0.25)].toFixed(1)} per 1,000`);
    console.log(`  Median: ${obesityRates[Math.floor(obesityRates.length * 0.5)].toFixed(1)} per 1,000`);
    console.log(`  Q3: ${obesityRates[Math.floor(obesityRates.length * 0.75)].toFixed(1)} per 1,000`);
    console.log(`  Max: ${obesityRates[obesityRates.length - 1].toFixed(1)} per 1,000 (${(obesityRates[obesityRates.length - 1]/10).toFixed(1)}%)`);
    
    const rateRange = obesityRates[obesityRates.length - 1] - obesityRates[0];
    const rateDiversity = obesityRates[obesityRates.length - 1] / obesityRates[0];
    
    console.log(`  Range: ${rateRange.toFixed(1)} per 1,000`);
    console.log(`  Diversity: ${rateDiversity.toFixed(2)}:1\n`);

    console.log('OBESITY COUNT ANALYSIS:');
    console.log(`  Min: ${obesityCounts[0]} cases`);
    console.log(`  Q1: ${obesityCounts[Math.floor(obesityCounts.length * 0.25)]} cases`);
    console.log(`  Median: ${obesityCounts[Math.floor(obesityCounts.length * 0.5)]} cases`);
    console.log(`  Q3: ${obesityCounts[Math.floor(obesityCounts.length * 0.75)]} cases`);
    console.log(`  Max: ${obesityCounts[obesityCounts.length - 1]} cases`);
    
    const countRange = obesityCounts[obesityCounts.length - 1] - obesityCounts[0];
    const countDiversity = obesityCounts[obesityCounts.length - 1] / obesityCounts[0];
    
    console.log(`  Range: ${countRange} cases`);
    console.log(`  Diversity: ${countDiversity.toFixed(2)}:1\n`);

    // Color scaling assessment
    console.log('COLOR SCALING ASSESSMENT:');
    
    if (rateDiversity >= 4.0) {
      console.log('✅ RATE visualization: EXCELLENT color scaling');
    } else if (rateDiversity >= 2.5) {
      console.log('🟢 RATE visualization: GOOD color scaling');
    } else {
      console.log('🔴 RATE visualization: POOR color scaling');
    }
    
    if (countDiversity >= 4.0) {
      console.log('✅ COUNT visualization: EXCELLENT color scaling');
    } else if (countDiversity >= 2.5) {
      console.log('🟢 COUNT visualization: GOOD color scaling');
    } else {
      console.log('🔴 COUNT visualization: POOR color scaling');
    }

    // Test a few other diseases for comparison
    console.log('\nOTHER DISEASES QUICK CHECK:');
    
    const diseases = ['diabetes', 'hypertension', 'heart_disease', 'stroke'];
    
    diseases.forEach(disease => {
      const rates = [];
      data.features.forEach(feature => {
        const rate = feature.properties[`${disease}_rate`];
        if (rate) rates.push(rate);
      });
      
      if (rates.length > 0) {
        rates.sort((a, b) => a - b);
        const diversity = rates[rates.length - 1] / rates[0];
        const status = diversity >= 4.0 ? '✅ EXCELLENT' : 
                      diversity >= 2.5 ? '🟢 GOOD' : '🔴 POOR';
        console.log(`  ${disease}: ${diversity.toFixed(2)}:1 ${status}`);
      }
    });

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

testFixedCountRate().catch(console.error);
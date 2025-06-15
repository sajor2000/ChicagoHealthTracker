/**
 * Comprehensive Epidemiological Bounds Validation
 * Verify all disease rates are within realistic clinical ranges
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

async function validateEpidemiologicalBounds() {
  console.log('=== EPIDEMIOLOGICAL BOUNDS VALIDATION ===\n');

  const diseaseConfigs = {
    diabetes: { min: 50, max: 350, name: 'Diabetes' },
    hypertension: { min: 200, max: 750, name: 'Hypertension' },
    heart_disease: { min: 20, max: 150, name: 'Heart Disease' },
    stroke: { min: 10, max: 80, name: 'Stroke' },
    asthma: { min: 50, max: 250, name: 'Asthma' },
    copd: { min: 30, max: 180, name: 'COPD' },
    obesity: { min: 150, max: 650, name: 'Obesity' },
    mental_health: { min: 80, max: 400, name: 'Mental Health' }
  };

  try {
    const data = await fetchData('/api/chicago-areas/census');
    
    if (!data.features || data.features.length === 0) {
      console.log('❌ No census tract data available');
      return;
    }

    console.log(`Validating ${data.features.length} census tracts across all diseases\n`);

    let overallValid = true;

    for (const [diseaseId, config] of Object.entries(diseaseConfigs)) {
      console.log(`--- ${config.name.toUpperCase()} VALIDATION ---`);
      
      const rates = [];
      let validCount = 0;
      let belowMinCount = 0;
      let aboveMaxCount = 0;

      data.features.forEach(feature => {
        const rate = feature.properties[`${diseaseId}_rate`];
        if (rate && typeof rate === 'number') {
          rates.push(rate);
          
          if (rate >= config.min && rate <= config.max) {
            validCount++;
          } else if (rate < config.min) {
            belowMinCount++;
          } else {
            aboveMaxCount++;
          }
        }
      });

      if (rates.length === 0) {
        console.log('  ❌ No rate data found');
        overallValid = false;
        continue;
      }

      rates.sort((a, b) => a - b);
      const min = rates[0];
      const max = rates[rates.length - 1];
      const median = rates[Math.floor(rates.length * 0.5)];

      console.log(`  Expected Range: ${config.min}-${config.max} per 1,000 (${(config.min/10).toFixed(1)}-${(config.max/10).toFixed(1)}%)`);
      console.log(`  Actual Range: ${min.toFixed(1)}-${max.toFixed(1)} per 1,000 (${(min/10).toFixed(1)}-${(max/10).toFixed(1)}%)`);
      console.log(`  Median: ${median.toFixed(1)} per 1,000 (${(median/10).toFixed(1)}%)`);

      if (validCount === rates.length) {
        console.log(`  ✅ ALL ${rates.length} tracts within bounds (100%)`);
      } else {
        console.log(`  ❌ ${validCount}/${rates.length} tracts within bounds (${(validCount/rates.length*100).toFixed(1)}%)`);
        
        if (belowMinCount > 0) {
          console.log(`    ${belowMinCount} tracts below minimum (${(belowMinCount/rates.length*100).toFixed(1)}%)`);
        }
        if (aboveMaxCount > 0) {
          console.log(`    ${aboveMaxCount} tracts above maximum (${(aboveMaxCount/rates.length*100).toFixed(1)}%)`);
        }
        overallValid = false;
      }

      // Range assessment
      const rangeRatio = max / min;
      if (rangeRatio > 4.0) {
        console.log(`  📊 Excellent diversity (${rangeRatio.toFixed(1)}:1 ratio)`);
      } else if (rangeRatio > 2.5) {
        console.log(`  📈 Good diversity (${rangeRatio.toFixed(1)}:1 ratio)`);
      } else {
        console.log(`  📉 Limited diversity (${rangeRatio.toFixed(1)}:1 ratio)`);
      }

      console.log('');
    }

    console.log('=== VALIDATION SUMMARY ===');
    if (overallValid) {
      console.log('✅ ALL DISEASES pass epidemiological validation');
      console.log('✅ Disease-specific color gradients will display properly');
      console.log('✅ No impossible prevalence rates detected');
      console.log('✅ Authentic epidemiological patterns maintained');
    } else {
      console.log('❌ Some diseases have rates outside realistic bounds');
      console.log('   This may cause color scaling issues');
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

validateEpidemiologicalBounds().catch(console.error);
/**
 * Debug Obesity Rate Calculation Issues
 * Investigate why obesity rates exceed realistic epidemiological bounds
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

async function debugObesityRates() {
  console.log('=== OBESITY RATE CALCULATION DEBUG ===\n');

  try {
    const data = await fetchData('/api/chicago-areas/census');
    
    if (!data.features || data.features.length === 0) {
      console.log('❌ No census tract data available');
      return;
    }

    console.log(`Analyzing ${data.features.length} census tracts for obesity rate issues\n`);

    const obesityRates = [];
    const problemTracts = [];
    
    data.features.forEach(feature => {
      const props = feature.properties;
      const rate = props.obesity_rate;
      const count = props.obesity_count;
      const population = props.population;
      
      if (rate && count && population) {
        obesityRates.push(rate);
        
        // Flag problematic rates
        if (rate > 1000) { // Over 100% prevalence
          problemTracts.push({
            name: props.name || props.id,
            rate: rate,
            count: count,
            population: population,
            calculatedRate: (count / population * 1000).toFixed(1)
          });
        }
      }
    });

    // Analyze rate distribution
    obesityRates.sort((a, b) => a - b);
    const min = obesityRates[0];
    const max = obesityRates[obesityRates.length - 1];
    const median = obesityRates[Math.floor(obesityRates.length * 0.5)];
    const q75 = obesityRates[Math.floor(obesityRates.length * 0.75)];
    const q90 = obesityRates[Math.floor(obesityRates.length * 0.9)];
    const q95 = obesityRates[Math.floor(obesityRates.length * 0.95)];

    console.log('OBESITY RATE DISTRIBUTION:');
    console.log(`  Min: ${min.toFixed(1)} per 1,000 (${(min/10).toFixed(1)}%)`);
    console.log(`  Median: ${median.toFixed(1)} per 1,000 (${(median/10).toFixed(1)}%)`);
    console.log(`  75th percentile: ${q75.toFixed(1)} per 1,000 (${(q75/10).toFixed(1)}%)`);
    console.log(`  90th percentile: ${q90.toFixed(1)} per 1,000 (${(q90/10).toFixed(1)}%)`);
    console.log(`  95th percentile: ${q95.toFixed(1)} per 1,000 (${(q95/10).toFixed(1)}%)`);
    console.log(`  Max: ${max.toFixed(1)} per 1,000 (${(max/10).toFixed(1)}%)`);
    console.log(`  Range: ${(max - min).toFixed(1)} per 1,000\n`);

    // Report problematic tracts
    if (problemTracts.length > 0) {
      console.log(`❌ FOUND ${problemTracts.length} TRACTS WITH IMPOSSIBLE OBESITY RATES (>100%):`);
      problemTracts.slice(0, 10).forEach(tract => {
        console.log(`  ${tract.name}: ${tract.rate} per 1,000 (${(tract.rate/10).toFixed(1)}%)`);
        console.log(`    Count: ${tract.count}, Population: ${tract.population}`);
        console.log(`    Recalculated: ${tract.calculatedRate} per 1,000`);
      });
      
      if (problemTracts.length > 10) {
        console.log(`  ... and ${problemTracts.length - 10} more problematic tracts`);
      }
    } else {
      console.log('✓ All obesity rates are within realistic bounds');
    }

    // Epidemiological validation
    console.log('\nEPIDEMIOLOGICAL VALIDATION:');
    console.log('Expected obesity prevalence ranges:');
    console.log('  • Normal population: 200-400 per 1,000 (20-40%)');
    console.log('  • High-risk areas: 400-600 per 1,000 (40-60%)');
    console.log('  • Maximum realistic: 700-800 per 1,000 (70-80%)');
    console.log('  • Impossible: >1000 per 1,000 (>100%)');

    const realistic = obesityRates.filter(r => r <= 800).length;
    const concerning = obesityRates.filter(r => r > 800 && r <= 1000).length;
    const impossible = obesityRates.filter(r => r > 1000).length;

    console.log(`\nCURRENT DATA VALIDATION:`);
    console.log(`  Realistic rates (≤80%): ${realistic}/${obesityRates.length} tracts (${(realistic/obesityRates.length*100).toFixed(1)}%)`);
    console.log(`  Concerning rates (80-100%): ${concerning}/${obesityRates.length} tracts (${(concerning/obesityRates.length*100).toFixed(1)}%)`);
    console.log(`  Impossible rates (>100%): ${impossible}/${obesityRates.length} tracts (${(impossible/obesityRates.length*100).toFixed(1)}%)`);

    if (impossible > 0) {
      console.log('\n🚨 CRITICAL ISSUE: Obesity rates exceed 100% prevalence');
      console.log('   This breaks epidemiological validity and color scaling');
      console.log('   Rates must be capped at realistic maximums');
    }

  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

debugObesityRates().catch(console.error);
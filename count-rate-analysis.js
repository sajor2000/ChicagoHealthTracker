/**
 * Analyze Count vs Rate Relationship
 * Investigates why count and rate visualizations appear nearly identical
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
 * Analyze Count vs Rate Relationship
 * Investigates why count and rate visualizations appear nearly identical
 */
async function analyzeCountRateRelationship() {
  console.log('=== COUNT VS RATE DIVERSITY ANALYSIS ===\n');

  try {
    const data = await fetchData('/api/chicago-areas/census');
    
    if (!data.features || data.features.length === 0) {
      console.log('❌ No census tract data available');
      return;
    }

    console.log(`Analyzing ${data.features.length} census tracts\n`);

    const diseases = ['diabetes', 'hypertension', 'heart_disease', 'copd', 'asthma', 'stroke', 'obesity', 'mental_health'];
    
    diseases.forEach(diseaseId => {
      console.log(`--- ${diseaseId.toUpperCase()} ANALYSIS ---`);
      
      const counts = [];
      const rates = [];
      const populations = [];
      
      // Collect data from sample of tracts
      data.features.slice(0, 100).forEach(feature => {
        const disease = feature.properties.diseases[diseaseId];
        const population = feature.properties.population;
        
        if (disease && population > 0) {
          counts.push(disease.count);
          rates.push(disease.rate);
          populations.push(population);
        }
      });
      
      if (counts.length === 0) {
        console.log('  ❌ No valid data found');
        return;
      }
      
      // Calculate statistics
      const countStats = {
        min: Math.min(...counts),
        max: Math.max(...counts),
        avg: Math.round(counts.reduce((a, b) => a + b, 0) / counts.length),
        range: Math.max(...counts) - Math.min(...counts)
      };
      
      const rateStats = {
        min: Math.min(...rates).toFixed(1),
        max: Math.max(...rates).toFixed(1),
        avg: (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(1),
        range: (Math.max(...rates) - Math.min(...rates)).toFixed(1)
      };
      
      const popStats = {
        min: Math.min(...populations),
        max: Math.max(...populations),
        avg: Math.round(populations.reduce((a, b) => a + b, 0) / populations.length)
      };
      
      // Calculate diversity metrics
      const countCV = (Math.sqrt(counts.reduce((sum, val) => sum + Math.pow(val - countStats.avg, 2), 0) / counts.length) / countStats.avg * 100).toFixed(1);
      const rateCV = (Math.sqrt(rates.reduce((sum, val) => sum + Math.pow(val - parseFloat(rateStats.avg), 2), 0) / rates.length) / parseFloat(rateStats.avg) * 100).toFixed(1);
      
      console.log(`  Count Stats: ${countStats.min}-${countStats.max} (avg: ${countStats.avg}, range: ${countStats.range})`);
      console.log(`  Rate Stats: ${rateStats.min}-${rateStats.max} (avg: ${rateStats.avg}, range: ${rateStats.range})`);
      console.log(`  Population: ${popStats.min}-${popStats.max} (avg: ${popStats.avg})`);
      console.log(`  Count Diversity (CV): ${countCV}%`);
      console.log(`  Rate Diversity (CV): ${rateCV}%`);
      
      // Diversity assessment
      if (parseFloat(countCV) < 30) {
        console.log(`  ⚠️  LOW COUNT DIVERSITY - Need more variation`);
      } else if (parseFloat(countCV) > 60) {
        console.log(`  ✓ GOOD COUNT DIVERSITY`);
      } else {
        console.log(`  ~ MODERATE COUNT DIVERSITY`);
      }
      console.log('');
    });
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
}

analyzeCountRateRelationship().catch(console.error);
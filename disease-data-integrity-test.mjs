/**
 * Comprehensive Disease Data Integrity Test
 * Validates all 8 diseases have complete count and rate data
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

async function validateDiseaseData() {
  const views = ['census', 'community', 'wards'];
  const expectedDiseases = ['diabetes', 'hypertension', 'heart_disease', 'copd', 'asthma', 'stroke', 'obesity', 'mental_health'];
  
  console.log('=== DISEASE DATA INTEGRITY VALIDATION ===\n');

  for (const view of views) {
    console.log(`--- ${view.toUpperCase()} VIEW ---`);
    
    try {
      const data = await fetchData(`/api/chicago-areas/${view}`);
      
      if (!data.features || data.features.length === 0) {
        console.log(`ERROR: No features found for ${view}`);
        continue;
      }
      
      console.log(`Loaded ${data.features.length} features`);
      
      // Test first 5 features for disease data completeness
      const sampleFeatures = data.features.slice(0, 5);
      
      expectedDiseases.forEach(diseaseId => {
        let validCount = 0;
        let totalCount = sampleFeatures.length;
        let sumCount = 0;
        let sumRate = 0;
        
        sampleFeatures.forEach((feature, index) => {
          const diseases = feature.properties.diseases;
          const diseaseData = diseases?.[diseaseId];
          
          if (diseaseData && diseaseData.count > 0 && diseaseData.rate > 0) {
            validCount++;
            sumCount += diseaseData.count;
            sumRate += diseaseData.rate;
          } else {
            console.log(`  Missing/invalid ${diseaseId} in feature ${index + 1}: count=${diseaseData?.count}, rate=${diseaseData?.rate}`);
          }
        });
        
        const avgCount = validCount > 0 ? (sumCount / validCount).toFixed(0) : 0;
        const avgRate = validCount > 0 ? (sumRate / validCount).toFixed(1) : 0;
        
        if (validCount === totalCount) {
          console.log(`  ✓ ${diseaseId}: Complete (avg: ${avgCount} count, ${avgRate} rate)`);
        } else {
          console.log(`  ❌ ${diseaseId}: ${validCount}/${totalCount} valid`);
        }
      });
      
      console.log('');
      
    } catch (error) {
      console.log(`ERROR testing ${view}: ${error.message}`);
    }
  }
  
  console.log('=== VALIDATION COMPLETE ===');
}

validateDiseaseData().catch(console.error);
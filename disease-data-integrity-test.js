/**
 * Comprehensive Disease Data Integrity Test
 * Validates all 8 diseases have complete count and rate data across all geographic levels
 */

const http = require('http');

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
    console.log(`\n--- ${view.toUpperCase()} VIEW ---`);
    
    try {
      const data = await fetchData(`/api/chicago-areas/${view}`);
      
      if (!data.features || data.features.length === 0) {
        console.log(`❌ ERROR: No features found for ${view}`);
        continue;
      }
      
      console.log(`✓ Loaded ${data.features.length} features`);
      
      // Test sample of features for complete disease data
      const sampleSize = Math.min(10, data.features.length);
      const sampleFeatures = data.features.slice(0, sampleSize);
      
      let totalValidFeatures = 0;
      let diseaseValidationResults = {};
      
      // Initialize disease validation tracking
      expectedDiseases.forEach(disease => {
        diseaseValidationResults[disease] = {
          validCount: 0,
          totalCount: sampleSize,
          sumCount: 0,
          sumRate: 0,
          hasData: false
        };
      });
      
      // Validate each feature
      for (let i = 0; i < sampleFeatures.length; i++) {
        const feature = sampleFeatures[i];
        const diseases = feature.properties.diseases;
        
        if (!diseases) {
          console.log(`❌ Feature ${i + 1}: Missing diseases object`);
          continue;
        }
        
        let featureValid = true;
        
        // Check each expected disease
        expectedDiseases.forEach(diseaseId => {
          const diseaseData = diseases[diseaseId];
          const result = diseaseValidationResults[diseaseId];
          
          if (!diseaseData) {
            console.log(`❌ Feature ${i + 1}: Missing ${diseaseId} data`);
            featureValid = false;
            return;
          }
          
          if (!diseaseData.count || diseaseData.count <= 0) {
            console.log(`❌ Feature ${i + 1}: ${diseaseId} has invalid count: ${diseaseData.count}`);
            featureValid = false;
            return;
          }
          
          if (!diseaseData.rate || diseaseData.rate <= 0) {
            console.log(`❌ Feature ${i + 1}: ${diseaseId} has invalid rate: ${diseaseData.rate}`);
            featureValid = false;
            return;
          }
          
          // Valid data found
          result.validCount++;
          result.sumCount += diseaseData.count;
          result.sumRate += diseaseData.rate;
          result.hasData = true;
        });
        
        if (featureValid) {
          totalValidFeatures++;
        }
      }
      
      // Report results
      console.log(`\nValidation Results (${sampleSize} features tested):`);
      console.log(`  Complete Features: ${totalValidFeatures}/${sampleSize} (${(totalValidFeatures/sampleSize*100).toFixed(1)}%)`);
      
      expectedDiseases.forEach(diseaseId => {
        const result = diseaseValidationResults[diseaseId];
        const validPct = (result.validCount / result.totalCount * 100).toFixed(1);
        const avgCount = result.validCount > 0 ? (result.sumCount / result.validCount).toFixed(0) : 0;
        const avgRate = result.validCount > 0 ? (result.sumRate / result.validCount).toFixed(1) : 0;
        
        if (result.validCount === result.totalCount) {
          console.log(`  ✓ ${diseaseId}: 100% valid (avg: ${avgCount} count, ${avgRate} rate)`);
        } else {
          console.log(`  ❌ ${diseaseId}: ${validPct}% valid (${result.validCount}/${result.totalCount})`);
        }
      });
      
    } catch (error) {
      console.log(`❌ ERROR testing ${view}: ${error.message}`);
    }
  }
  
  console.log('\n=== VALIDATION COMPLETE ===');
}

// Run the validation
validateDiseaseData().catch(console.error);
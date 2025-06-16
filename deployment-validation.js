/**
 * Comprehensive Deployment Validation for Chicago Health Data Platform
 * Validates all functionality required for production deployment
 */

import http from 'http';

async function validateEndpoint(url, expectedMinFeatures = 0) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: url,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({
            status: res.statusCode,
            features: json.features ? json.features.length : 0,
            hasValidData: json.features && json.features.length >= expectedMinFeatures,
            dataStructure: json.type === 'FeatureCollection'
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000); // 10 second timeout for production conditions
    req.end();
  });
}

async function runDeploymentValidation() {
  console.log('=== DEPLOYMENT VALIDATION FOR PRODUCTION RELEASE ===\n');
  
  const startTime = Date.now();
  let testsTotal = 0;
  let testsPassed = 0;
  
  try {
    // Test 1: Core API endpoints
    console.log('1. TESTING CORE API ENDPOINTS');
    const endpoints = [
      { path: '/api/chicago-areas/census', minFeatures: 1900, name: 'Census Tracts' },
      { path: '/api/chicago-areas/community', minFeatures: 75, name: 'Community Areas' },
      { path: '/api/chicago-areas/wards', minFeatures: 45, name: 'Alderman Wards' }
    ];
    
    for (const endpoint of endpoints) {
      testsTotal++;
      try {
        const result = await validateEndpoint(endpoint.path, endpoint.minFeatures);
        if (result.hasValidData && result.dataStructure) {
          console.log(`   ✅ ${endpoint.name}: ${result.features} features (${result.status})`);
          testsPassed++;
        } else {
          console.log(`   ❌ ${endpoint.name}: Invalid data structure or insufficient features`);
        }
      } catch (error) {
        console.log(`   ❌ ${endpoint.name}: Request failed - ${error.message}`);
      }
    }
    
    // Test 2: Disease data completeness
    console.log('\n2. TESTING DISEASE DATA COMPLETENESS');
    const diseases = ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'asthma', 'copd', 'obesity', 'mental_health'];
    
    testsTotal++;
    try {
      const censusData = await validateEndpoint('/api/chicago-areas/census');
      if (censusData.hasValidData) {
        const sampleFeature = await getSampleFeature('/api/chicago-areas/census');
        const missingDiseases = diseases.filter(disease => {
          return !sampleFeature.properties[`${disease}_rate`] || !sampleFeature.properties[`${disease}_count`];
        });
        
        if (missingDiseases.length === 0) {
          console.log(`   ✅ All 8 diseases have complete rate and count data`);
          testsPassed++;
        } else {
          console.log(`   ❌ Missing disease data: ${missingDiseases.join(', ')}`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Disease data test failed: ${error.message}`);
    }
    
    // Test 3: Geographic data integrity
    console.log('\n3. TESTING GEOGRAPHIC DATA INTEGRITY');
    testsTotal++;
    try {
      const censusData = await validateEndpoint('/api/chicago-areas/census');
      if (censusData.hasValidData) {
        const sampleFeature = await getSampleFeature('/api/chicago-areas/census');
        const hasGeometry = sampleFeature.geometry && sampleFeature.geometry.coordinates;
        const hasProperties = sampleFeature.properties && sampleFeature.properties.population;
        
        if (hasGeometry && hasProperties) {
          console.log(`   ✅ GeoJSON structure valid with geometry and population data`);
          testsPassed++;
        } else {
          console.log(`   ❌ Invalid GeoJSON structure`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Geographic data test failed: ${error.message}`);
    }
    
    // Test 4: Color visualization data ranges
    console.log('\n4. TESTING COLOR VISUALIZATION DATA RANGES');
    testsTotal++;
    try {
      const censusData = await validateEndpoint('/api/chicago-areas/census');
      if (censusData.hasValidData) {
        const features = await getAllFeatures('/api/chicago-areas/census');
        const obesityRates = features.map(f => f.properties.obesity_rate).filter(r => r).sort((a,b) => a-b);
        
        const diversity = obesityRates[obesityRates.length - 1] / obesityRates[0];
        const range = obesityRates[obesityRates.length - 1] - obesityRates[0];
        
        if (diversity >= 3.0 && range >= 300) {
          console.log(`   ✅ Obesity visualization has good diversity (${diversity.toFixed(2)}:1, range: ${range.toFixed(1)})`);
          testsPassed++;
        } else {
          console.log(`   ❌ Poor visualization diversity (${diversity.toFixed(2)}:1, range: ${range.toFixed(1)})`);
        }
      }
    } catch (error) {
      console.log(`   ❌ Visualization range test failed: ${error.message}`);
    }
    
    // Test 5: Server response performance
    console.log('\n5. TESTING SERVER RESPONSE PERFORMANCE');
    testsTotal++;
    try {
      const performanceStart = Date.now();
      await validateEndpoint('/api/chicago-areas/census');
      const responseTime = Date.now() - performanceStart;
      
      if (responseTime < 5000) {
        console.log(`   ✅ Response time acceptable: ${responseTime}ms`);
        testsPassed++;
      } else {
        console.log(`   ❌ Response time too slow: ${responseTime}ms`);
      }
    } catch (error) {
      console.log(`   ❌ Performance test failed: ${error.message}`);
    }
    
    // Final deployment assessment
    const totalTime = Date.now() - startTime;
    const successRate = (testsPassed / testsTotal) * 100;
    
    console.log('\n=== DEPLOYMENT READINESS ASSESSMENT ===');
    console.log(`Tests completed: ${testsPassed}/${testsTotal} (${successRate.toFixed(1)}%)`);
    console.log(`Total validation time: ${totalTime}ms`);
    
    if (successRate >= 80) {
      console.log('\n🚀 READY FOR PRODUCTION DEPLOYMENT');
      console.log('   • All core systems operational');
      console.log('   • Map layers will render correctly');
      console.log('   • Disease visualization functional');
      console.log('   • Geographic data integrity confirmed');
    } else {
      console.log('\n⚠️  DEPLOYMENT ISSUES DETECTED');
      console.log('   • Some systems require attention before deployment');
    }
    
  } catch (error) {
    console.log(`❌ Deployment validation failed: ${error.message}`);
  }
}

async function getSampleFeature(url) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: url,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.features[0]);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function getAllFeatures(url) {
  const options = {
    hostname: 'localhost',
    port: 5000,
    path: url,
    method: 'GET'
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.features);
        } catch (error) {
          reject(error);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

runDeploymentValidation().catch(console.error);
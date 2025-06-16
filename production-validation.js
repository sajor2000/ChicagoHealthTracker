/**
 * Comprehensive Production Validation Script
 * Validates all aspects of the Chicago Health Data Platform for deployment
 */

const BASE_URL = process.env.REPL_URL || 'http://localhost:5000';

async function validateProductionReadiness() {
  console.log('🔍 Starting comprehensive production validation...');
  console.log(`Base URL: ${BASE_URL}`);
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    baseUrl: BASE_URL,
    tests: [],
    summary: {
      passed: 0,
      failed: 0,
      warnings: 0
    }
  };

  // Test 1: Basic Health Check
  await runTest('Health Check', async () => {
    const response = await fetch(`${BASE_URL}/api/health-check`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return { status: data.status, timestamp: data.timestamp };
  }, results);

  // Test 2: Debug Status Check
  await runTest('Debug Status', async () => {
    const response = await fetch(`${BASE_URL}/api/debug/status`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    return {
      census: data.hasData.census,
      censusFeatures: data.hasData.censusFeatures,
      community: data.hasData.community,
      communityFeatures: data.hasData.communityFeatures,
      wards: data.hasData.wards,
      wardsFeatures: data.hasData.wardsFeatures,
      loadStatus: data.dataLoadStatus.census
    };
  }, results);

  // Test 3: Census Data Endpoint
  await runTest('Census Data API', async () => {
    const response = await fetch(`${BASE_URL}/api/chicago-areas/census`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      throw new Error('No census features returned');
    }
    return {
      type: data.type,
      features: data.features.length,
      sampleFeature: data.features[0]?.properties?.name || 'Unknown'
    };
  }, results);

  // Test 4: Community Areas Data
  await runTest('Community Areas API', async () => {
    const response = await fetch(`${BASE_URL}/api/chicago-areas/community`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      throw new Error('No community features returned');
    }
    return {
      type: data.type,
      features: data.features.length,
      sampleFeature: data.features[0]?.properties?.name || 'Unknown'
    };
  }, results);

  // Test 5: Wards Data
  await runTest('Wards Data API', async () => {
    const response = await fetch(`${BASE_URL}/api/chicago-areas/wards`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    if (!data.features || data.features.length === 0) {
      throw new Error('No ward features returned');
    }
    return {
      type: data.type,
      features: data.features.length,
      sampleFeature: data.features[0]?.properties?.name || 'Unknown'
    };
  }, results);

  // Test 6: Disease Data Validation
  await runTest('Disease Data Validation', async () => {
    const response = await fetch(`${BASE_URL}/api/chicago-areas/census`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    
    const sampleFeature = data.features[0];
    const diseases = sampleFeature.properties.diseases;
    const expectedDiseases = ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'asthma', 'copd', 'obesity', 'mental_health'];
    
    const missingDiseases = expectedDiseases.filter(d => !diseases[d]);
    if (missingDiseases.length > 0) {
      throw new Error(`Missing diseases: ${missingDiseases.join(', ')}`);
    }
    
    return {
      availableDiseases: Object.keys(diseases),
      sampleRates: {
        diabetes: diseases.diabetes?.rate,
        hypertension: diseases.hypertension?.rate,
        obesity: diseases.obesity?.rate
      }
    };
  }, results);

  // Test 7: Geographic Data Quality
  await runTest('Geographic Data Quality', async () => {
    const response = await fetch(`${BASE_URL}/api/chicago-areas/census`);
    if (!response.ok) throw new Error(`Status: ${response.status}`);
    const data = await response.json();
    
    let validGeometry = 0;
    let validPopulation = 0;
    let validDiseases = 0;
    
    data.features.forEach(feature => {
      if (feature.geometry && feature.geometry.coordinates) validGeometry++;
      if (feature.properties.population > 0) validPopulation++;
      if (feature.properties.diseases && Object.keys(feature.properties.diseases).length >= 8) validDiseases++;
    });
    
    const total = data.features.length;
    return {
      totalFeatures: total,
      validGeometry: validGeometry,
      validPopulation: validPopulation,
      validDiseases: validDiseases,
      geometryQuality: `${((validGeometry/total)*100).toFixed(1)}%`,
      populationQuality: `${((validPopulation/total)*100).toFixed(1)}%`,
      diseaseQuality: `${((validDiseases/total)*100).toFixed(1)}%`
    };
  }, results);

  // Summary
  console.log('\n📊 PRODUCTION VALIDATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`Environment: ${results.environment}`);
  console.log(`Base URL: ${results.baseUrl}`);
  console.log(`Tests Passed: ${results.summary.passed}`);
  console.log(`Tests Failed: ${results.summary.failed}`);
  console.log(`Warnings: ${results.summary.warnings}`);
  
  const overallStatus = results.summary.failed === 0 ? 'READY' : 'NOT READY';
  const statusIcon = results.summary.failed === 0 ? '✅' : '❌';
  
  console.log(`\n${statusIcon} Overall Status: ${overallStatus} FOR DEPLOYMENT`);
  
  if (results.summary.failed > 0) {
    console.log('\n🔧 Issues to resolve:');
    results.tests.filter(t => t.status === 'FAILED').forEach(test => {
      console.log(`   - ${test.name}: ${test.error}`);
    });
  }
  
  return results;
}

async function runTest(name, testFn, results) {
  try {
    console.log(`\n🧪 Testing: ${name}`);
    const result = await testFn();
    console.log(`✅ ${name}: PASSED`);
    console.log(`   Details:`, JSON.stringify(result, null, 2));
    
    results.tests.push({
      name,
      status: 'PASSED',
      result,
      timestamp: new Date().toISOString()
    });
    results.summary.passed++;
    
  } catch (error) {
    console.log(`❌ ${name}: FAILED`);
    console.log(`   Error: ${error.message}`);
    
    results.tests.push({
      name,
      status: 'FAILED',
      error: error.message,
      timestamp: new Date().toISOString()
    });
    results.summary.failed++;
  }
}

// Run validation if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateProductionReadiness()
    .then(results => {
      const exitCode = results.summary.failed > 0 ? 1 : 0;
      process.exit(exitCode);
    })
    .catch(error => {
      console.error('Validation script failed:', error);
      process.exit(1);
    });
}

export { validateProductionReadiness };
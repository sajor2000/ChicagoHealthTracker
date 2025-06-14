/**
 * Production Readiness Test for Chicago Health Data Mapping Application
 * Tests all geographic views, disease categories, and functionality
 */

const BASE_URL = 'http://localhost:5000';

// Test all geographic view endpoints
const geographicViews = ['census', 'community', 'wards'];

// Test all disease categories
const diseases = ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'asthma', 'copd', 'obesity', 'mental_health'];

// Test visualization modes
const visualizationModes = ['count', 'rate'];

async function testEndpoint(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error || 'Unknown error', status: response.status };
    }
    
    // Validate FeatureCollection structure
    if (data.type !== 'FeatureCollection' || !Array.isArray(data.features)) {
      return { success: false, error: 'Invalid GeoJSON structure' };
    }
    
    // Check if features have required properties
    const feature = data.features[0];
    if (!feature || !feature.properties || !feature.geometry) {
      return { success: false, error: 'Missing feature properties or geometry' };
    }
    
    // Validate disease data exists
    const props = feature.properties;
    if (!props.diseases || !props.population || !props.density) {
      return { success: false, error: 'Missing required data fields' };
    }
    
    return { 
      success: true, 
      featureCount: data.features.length,
      sampleId: props.id,
      sampleName: props.name,
      diseaseKeys: Object.keys(props.diseases || {})
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runProductionTests() {
  console.log('🔍 Starting Production Readiness Tests for Chicago Health Data Platform\n');
  
  const results = {
    geographicViews: {},
    totalEndpoints: 0,
    successfulEndpoints: 0,
    errors: []
  };
  
  // Test all geographic view endpoints
  for (const view of geographicViews) {
    console.log(`📍 Testing ${view} view...`);
    const url = `${BASE_URL}/api/chicago-areas/${view}`;
    const result = await testEndpoint(url);
    
    results.geographicViews[view] = result;
    results.totalEndpoints++;
    
    if (result.success) {
      results.successfulEndpoints++;
      console.log(`  ✅ ${view}: ${result.featureCount} features loaded`);
      console.log(`     Sample: ${result.sampleName} (${result.sampleId})`);
      console.log(`     Diseases: ${result.diseaseKeys.join(', ')}`);
    } else {
      console.log(`  ❌ ${view}: ${result.error} (Status: ${result.status || 'N/A'})`);
      results.errors.push(`${view}: ${result.error}`);
    }
    console.log('');
  }
  
  // Test health data completeness
  console.log('🏥 Validating Health Data Completeness...');
  const censusData = results.geographicViews.census;
  if (censusData.success) {
    const missingDiseases = diseases.filter(d => !censusData.diseaseKeys.includes(d));
    if (missingDiseases.length === 0) {
      console.log('  ✅ All 8 disease categories present');
    } else {
      console.log(`  ⚠️  Missing diseases: ${missingDiseases.join(', ')}`);
      results.errors.push(`Missing diseases: ${missingDiseases.join(', ')}`);
    }
  }
  
  // Summary report
  console.log('\n📊 Production Readiness Summary:');
  console.log(`   Geographic Views: ${results.successfulEndpoints}/${results.totalEndpoints} working`);
  console.log(`   Total Features: ${Object.values(results.geographicViews).reduce((sum, r) => sum + (r.featureCount || 0), 0)}`);
  console.log(`   Success Rate: ${((results.successfulEndpoints / results.totalEndpoints) * 100).toFixed(1)}%`);
  
  if (results.errors.length > 0) {
    console.log('\n❌ Issues Found:');
    results.errors.forEach(error => console.log(`   - ${error}`));
  } else {
    console.log('\n✅ All systems ready for production deployment');
  }
  
  return results;
}

// Run tests
runProductionTests().catch(console.error);
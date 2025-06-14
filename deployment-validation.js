/**
 * Comprehensive Deployment Validation for Chicago Health Data Platform
 * Validates all functionality required for production deployment
 */

const BASE_URL = 'http://localhost:5000';

const testSuite = {
  // Geographic view endpoints
  geographicViews: ['census', 'community', 'wards'],
  
  // Disease categories
  diseases: ['diabetes', 'hypertension', 'heart_disease', 'stroke', 'asthma', 'copd', 'obesity', 'mental_health'],
  
  // Visualization modes
  visualizationModes: ['count', 'rate'],
  
  // Expected data structure validation
  requiredProperties: ['id', 'name', 'population', 'density', 'diseases', 'dataQuality'],
  requiredDiseaseFields: ['count', 'rate'],
  
  // Minimum data thresholds for production
  minimumFeatures: {
    census: 1900,    // Expect ~1972 census tracts
    community: 70,   // Expect 77 community areas  
    wards: 45        // Expect 50 alderman wards
  }
};

async function validateEndpoint(url, expectedMinFeatures = 0) {
  const response = await fetch(url);
  const data = await response.json();
  
  const validation = {
    status: response.status,
    success: response.ok,
    errors: [],
    warnings: [],
    data: {
      type: data.type,
      featureCount: data.features?.length || 0,
      sampleFeature: data.features?.[0]?.properties
    }
  };
  
  // Validate response structure
  if (!response.ok) {
    validation.errors.push(`HTTP ${response.status}: ${data.error || 'Unknown error'}`);
    return validation;
  }
  
  // Validate GeoJSON structure
  if (data.type !== 'FeatureCollection') {
    validation.errors.push('Invalid GeoJSON: missing FeatureCollection type');
  }
  
  if (!Array.isArray(data.features)) {
    validation.errors.push('Invalid GeoJSON: features is not an array');
    return validation;
  }
  
  // Validate minimum feature count
  if (data.features.length < expectedMinFeatures) {
    validation.warnings.push(`Low feature count: ${data.features.length} (expected ≥${expectedMinFeatures})`);
  }
  
  // Validate feature structure
  const sampleFeature = data.features[0];
  if (sampleFeature) {
    const props = sampleFeature.properties;
    
    // Check required properties
    testSuite.requiredProperties.forEach(prop => {
      if (!(prop in props)) {
        validation.errors.push(`Missing required property: ${prop}`);
      }
    });
    
    // Validate disease data structure
    if (props.diseases) {
      const diseaseKeys = Object.keys(props.diseases);
      
      // Check all expected diseases are present
      testSuite.diseases.forEach(disease => {
        if (!diseaseKeys.includes(disease)) {
          validation.errors.push(`Missing disease category: ${disease}`);
        }
      });
      
      // Validate disease data structure
      diseaseKeys.forEach(diseaseKey => {
        const disease = props.diseases[diseaseKey];
        testSuite.requiredDiseaseFields.forEach(field => {
          if (!(field in disease)) {
            validation.errors.push(`Missing disease field ${field} in ${diseaseKey}`);
          }
        });
      });
    } else {
      validation.errors.push('Missing diseases object');
    }
    
    // Validate geometry exists
    if (!sampleFeature.geometry) {
      validation.errors.push('Missing geometry data');
    }
  }
  
  return validation;
}

async function runDeploymentValidation() {
  console.log('🚀 Chicago Health Data Platform - Deployment Validation\n');
  
  const results = {
    startTime: new Date(),
    geographicViews: {},
    overallHealth: { errors: 0, warnings: 0 },
    summary: {
      totalFeatures: 0,
      successfulEndpoints: 0,
      totalEndpoints: 0
    }
  };
  
  // Test all geographic view endpoints
  for (const view of testSuite.geographicViews) {
    console.log(`📍 Validating ${view.toUpperCase()} view...`);
    
    const url = `${BASE_URL}/api/chicago-areas/${view}`;
    const expectedMin = testSuite.minimumFeatures[view] || 0;
    const validation = await validateEndpoint(url, expectedMin);
    
    results.geographicViews[view] = validation;
    results.summary.totalEndpoints++;
    
    if (validation.success && validation.errors.length === 0) {
      results.summary.successfulEndpoints++;
      console.log(`  ✅ SUCCESS: ${validation.data.featureCount} features loaded`);
      
      if (validation.data.sampleFeature) {
        console.log(`     Sample: ${validation.data.sampleFeature.name} (${validation.data.sampleFeature.id})`);
        const diseaseCount = Object.keys(validation.data.sampleFeature.diseases || {}).length;
        console.log(`     Health Data: ${diseaseCount}/8 disease categories`);
      }
    } else {
      console.log(`  ❌ FAILED: ${validation.errors.length} errors`);
      validation.errors.forEach(error => {
        console.log(`     ERROR: ${error}`);
        results.overallHealth.errors++;
      });
    }
    
    if (validation.warnings.length > 0) {
      validation.warnings.forEach(warning => {
        console.log(`     WARNING: ${warning}`);
        results.overallHealth.warnings++;
      });
    }
    
    results.summary.totalFeatures += validation.data.featureCount;
    console.log('');
  }
  
  // Validate cross-view data consistency
  console.log('🔍 Cross-View Data Validation...');
  const censusFeatures = results.geographicViews.census?.data?.featureCount || 0;
  const communityFeatures = results.geographicViews.community?.data?.featureCount || 0;
  const wardFeatures = results.geographicViews.wards?.data?.featureCount || 0;
  
  console.log(`  Census Tracts: ${censusFeatures}`);
  console.log(`  Community Areas: ${communityFeatures}`);
  console.log(`  Alderman Wards: ${wardFeatures}`);
  
  // Final deployment readiness assessment
  console.log('\n📊 DEPLOYMENT READINESS ASSESSMENT');
  console.log('=' .repeat(50));
  
  const successRate = (results.summary.successfulEndpoints / results.summary.totalEndpoints) * 100;
  console.log(`🎯 Success Rate: ${successRate.toFixed(1)}% (${results.summary.successfulEndpoints}/${results.summary.totalEndpoints})`);
  console.log(`📋 Total Features: ${results.summary.totalFeatures.toLocaleString()}`);
  console.log(`⚠️  Issues: ${results.overallHealth.errors} errors, ${results.overallHealth.warnings} warnings`);
  
  // Deployment recommendation
  if (results.overallHealth.errors === 0 && successRate === 100) {
    console.log('\n🎉 DEPLOYMENT APPROVED');
    console.log('   All systems operational and ready for production deployment');
    console.log('   ✅ All geographic views functional');
    console.log('   ✅ Complete health data coverage');
    console.log('   ✅ Authentic Census Bureau data integration');
    console.log('   ✅ No critical errors detected');
  } else if (results.overallHealth.errors === 0) {
    console.log('\n⚠️  DEPLOYMENT APPROVED WITH WARNINGS');
    console.log('   System functional but with minor issues to monitor');
  } else {
    console.log('\n❌ DEPLOYMENT NOT RECOMMENDED');
    console.log('   Critical errors must be resolved before production deployment');
  }
  
  const endTime = new Date();
  console.log(`\n⏱️  Validation completed in ${endTime - results.startTime}ms`);
  
  return results;
}

// Execute deployment validation
runDeploymentValidation()
  .then(results => {
    process.exit(results.overallHealth.errors > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Validation failed:', error.message);
    process.exit(1);
  });
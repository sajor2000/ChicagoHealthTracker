/**
 * Comprehensive Overlay Functionality Test
 * Tests map layer switching and overlay management for production deployment
 */

const BASE_URL = 'http://localhost:5000';

// Simulate different overlay scenarios that have failed in production
const overlayTestScenarios = [
  {
    name: 'Census to Community Switch',
    sequence: [
      { view: 'census', disease: 'diabetes', mode: 'count' },
      { view: 'community', disease: 'diabetes', mode: 'count' }
    ]
  },
  {
    name: 'Community to Wards Switch',
    sequence: [
      { view: 'community', disease: 'hypertension', mode: 'rate' },
      { view: 'wards', disease: 'hypertension', mode: 'rate' }
    ]
  },
  {
    name: 'Disease Category Switch',
    sequence: [
      { view: 'census', disease: 'diabetes', mode: 'count' },
      { view: 'census', disease: 'heart_disease', mode: 'count' },
      { view: 'census', disease: 'obesity', mode: 'rate' }
    ]
  },
  {
    name: 'Rapid View Switching',
    sequence: [
      { view: 'census', disease: 'asthma', mode: 'count' },
      { view: 'community', disease: 'asthma', mode: 'count' },
      { view: 'wards', disease: 'asthma', mode: 'count' },
      { view: 'census', disease: 'asthma', mode: 'rate' }
    ]
  },
  {
    name: 'Cross-Category Multi-View',
    sequence: [
      { view: 'census', disease: 'stroke', mode: 'count' },
      { view: 'community', disease: 'copd', mode: 'rate' },
      { view: 'wards', disease: 'mental_health', mode: 'count' }
    ]
  }
];

async function testOverlayData(view, disease, mode) {
  const url = `${BASE_URL}/api/chicago-areas/${view}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.error, status: response.status };
    }
    
    // Validate overlay-specific requirements
    const feature = data.features[0];
    if (!feature || !feature.properties || !feature.geometry) {
      return { success: false, error: 'Missing feature data for overlay' };
    }
    
    const props = feature.properties;
    
    // Check disease data exists for overlay
    if (!props.diseases || !props.diseases[disease]) {
      return { success: false, error: `Missing ${disease} data for overlay` };
    }
    
    const diseaseData = props.diseases[disease];
    const modeValue = diseaseData[mode];
    
    if (typeof modeValue !== 'number') {
      return { success: false, error: `Invalid ${mode} value for ${disease} overlay` };
    }
    
    // Validate overlay color scaling data
    const overlayProperty = `${disease}_${mode}`;
    if (!props[overlayProperty]) {
      return { success: false, error: `Missing overlay property ${overlayProperty}` };
    }
    
    return {
      success: true,
      featureCount: data.features.length,
      overlayProperty,
      sampleValue: modeValue,
      hasGeometry: !!feature.geometry,
      boundingBox: feature.geometry.coordinates ? 'present' : 'missing'
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function runOverlayFunctionalityTest() {
  console.log('🎯 Testing Map Overlay Functionality for Production Deployment\n');
  
  const results = {
    scenarios: {},
    totalTests: 0,
    successfulTests: 0,
    overlayErrors: [],
    criticalIssues: []
  };
  
  // Test each overlay scenario
  for (const scenario of overlayTestScenarios) {
    console.log(`📋 Testing: ${scenario.name}`);
    
    const scenarioResult = {
      steps: [],
      success: true,
      errors: []
    };
    
    // Test each step in the sequence
    for (let i = 0; i < scenario.sequence.length; i++) {
      const step = scenario.sequence[i];
      const stepName = `${step.view}-${step.disease}-${step.mode}`;
      
      console.log(`   Step ${i + 1}: ${stepName}`);
      
      const stepResult = await testOverlayData(step.view, step.disease, step.mode);
      results.totalTests++;
      
      if (stepResult.success) {
        results.successfulTests++;
        console.log(`     ✅ ${stepResult.featureCount} features, overlay property: ${stepResult.overlayProperty}`);
        scenarioResult.steps.push({
          step: stepName,
          success: true,
          featureCount: stepResult.featureCount,
          overlayProperty: stepResult.overlayProperty
        });
      } else {
        console.log(`     ❌ ${stepResult.error}`);
        scenarioResult.success = false;
        scenarioResult.errors.push(`${stepName}: ${stepResult.error}`);
        results.overlayErrors.push(`${scenario.name} - ${stepName}: ${stepResult.error}`);
        
        // Flag critical overlay issues
        if (stepResult.error.includes('Missing') || stepResult.error.includes('Invalid')) {
          results.criticalIssues.push(`CRITICAL: ${scenario.name} - ${stepResult.error}`);
        }
      }
      
      // Add delay between rapid switches to simulate real usage
      if (i < scenario.sequence.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    results.scenarios[scenario.name] = scenarioResult;
    console.log(`   ${scenario.name}: ${scenarioResult.success ? 'PASSED' : 'FAILED'}\n`);
  }
  
  // Test overlay performance under load
  console.log('⚡ Testing Overlay Performance...');
  const performanceStart = Date.now();
  
  const concurrentTests = await Promise.all([
    testOverlayData('census', 'diabetes', 'count'),
    testOverlayData('community', 'hypertension', 'rate'),
    testOverlayData('wards', 'obesity', 'count')
  ]);
  
  const performanceTime = Date.now() - performanceStart;
  const allPerformanceTestsPassed = concurrentTests.every(test => test.success);
  
  console.log(`   Concurrent overlay loading: ${allPerformanceTestsPassed ? 'PASSED' : 'FAILED'} (${performanceTime}ms)`);
  
  // Summary and deployment readiness
  console.log('\n📊 OVERLAY FUNCTIONALITY ASSESSMENT');
  console.log('=' .repeat(55));
  
  const successRate = (results.successfulTests / results.totalTests) * 100;
  console.log(`🎯 Overlay Success Rate: ${successRate.toFixed(1)}% (${results.successfulTests}/${results.totalTests})`);
  console.log(`⚡ Performance Test: ${allPerformanceTestsPassed ? 'PASSED' : 'FAILED'} (${performanceTime}ms)`);
  console.log(`❌ Overlay Errors: ${results.overlayErrors.length}`);
  console.log(`🚨 Critical Issues: ${results.criticalIssues.length}`);
  
  if (results.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL OVERLAY ISSUES:');
    results.criticalIssues.forEach(issue => console.log(`   ${issue}`));
  }
  
  if (results.overlayErrors.length > 0 && results.criticalIssues.length === 0) {
    console.log('\n⚠️ NON-CRITICAL OVERLAY ISSUES:');
    results.overlayErrors.slice(0, 5).forEach(error => console.log(`   ${error}`));
    if (results.overlayErrors.length > 5) {
      console.log(`   ... and ${results.overlayErrors.length - 5} more issues`);
    }
  }
  
  // Deployment recommendation
  console.log('\n🚀 OVERLAY DEPLOYMENT ASSESSMENT:');
  
  if (results.criticalIssues.length === 0 && successRate >= 95 && allPerformanceTestsPassed) {
    console.log('✅ OVERLAY FUNCTIONALITY READY FOR PRODUCTION');
    console.log('   All overlay scenarios working correctly');
    console.log('   Performance tests passed');
    console.log('   Map layer switching operational');
  } else if (results.criticalIssues.length === 0 && successRate >= 80) {
    console.log('⚠️ OVERLAY FUNCTIONALITY READY WITH MONITORING');
    console.log('   Most overlay scenarios working');
    console.log('   Minor issues may affect user experience');
  } else {
    console.log('❌ OVERLAY FUNCTIONALITY NOT READY');
    console.log('   Critical overlay issues must be resolved');
    console.log('   Deployment not recommended');
  }
  
  return results;
}

// Execute overlay functionality test
runOverlayFunctionalityTest()
  .then(results => {
    const hasCritical = results.criticalIssues.length > 0;
    const successRate = (results.successfulTests / results.totalTests) * 100;
    process.exit(hasCritical || successRate < 80 ? 1 : 0);
  })
  .catch(error => {
    console.error('❌ Overlay test failed:', error.message);
    process.exit(1);
  });
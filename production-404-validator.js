/**
 * Production 404 Error Validator
 * Specifically tests for deployment issues causing overlay failures
 */

// Test all critical endpoints and assets
const criticalEndpoints = [
  '/api/health-check',
  '/api/health', 
  '/api/chicago-areas/census',
  '/api/chicago-areas/community',
  '/api/chicago-areas/wards'
];

const criticalAssets = [
  '/assets/index.js',
  '/assets/index.css'
];

async function validateProduction404Issues() {
  console.log('🔍 Production 404 Error Validation');
  console.log('===================================');
  
  let errorCount = 0;
  
  // Test API endpoints
  console.log('\n📡 API Endpoint Status:');
  for (const endpoint of criticalEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.status === 404) {
        console.log(`❌ ${endpoint}: 404 NOT FOUND`);
        errorCount++;
      } else if (response.status === 200) {
        if (endpoint.includes('chicago-areas')) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: ${data.features?.length || 0} features`);
        } else {
          console.log(`✅ ${endpoint}: OK`);
        }
      } else {
        console.log(`⚠️  ${endpoint}: ${response.status}`);
        errorCount++;
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Test static assets
  console.log('\n📁 Static Asset Status:');
  for (const asset of criticalAssets) {
    try {
      const response = await fetch(asset);
      if (response.status === 404) {
        console.log(`❌ ${asset}: 404 NOT FOUND`);
        errorCount++;
      } else {
        console.log(`✅ ${asset}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${asset}: ${error.message}`);
      errorCount++;
    }
  }
  
  // Test Mapbox integration
  console.log('\n🗺️  Mapbox Integration:');
  const mapboxToken = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
  try {
    const styleUrl = `https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=${mapboxToken}`;
    const response = await fetch(styleUrl);
    if (response.status === 401) {
      console.log('❌ Mapbox: 401 UNAUTHORIZED - Token invalid');
      errorCount++;
    } else if (response.status === 200) {
      console.log('✅ Mapbox: Style accessible');
    } else {
      console.log(`⚠️  Mapbox: ${response.status}`);
    }
  } catch (error) {
    console.log(`❌ Mapbox: ${error.message}`);
    errorCount++;
  }
  
  // Environment analysis
  console.log('\n🌐 Environment Analysis:');
  console.log(`Protocol: ${window.location.protocol}`);
  console.log(`Host: ${window.location.host}`);
  console.log(`Production: ${window.location.hostname.includes('replit.dev')}`);
  
  // Layer persistence test
  console.log('\n🎨 Layer Persistence Test:');
  const checkLayers = () => {
    const layerIds = ['census-data-fill', 'community-data-fill', 'wards-data-fill'];
    layerIds.forEach(layerId => {
      const exists = document.querySelector(`[data-layer-id="${layerId}"]`) || 
                    (window.mapboxMap && window.mapboxMap.getLayer && window.mapboxMap.getLayer(layerId));
      console.log(`${exists ? '✅' : '❌'} Layer ${layerId}: ${exists ? 'EXISTS' : 'MISSING'}`);
    });
  };
  
  // Check immediately and after delay
  checkLayers();
  setTimeout(() => {
    console.log('\n🔄 Layer Persistence After 5s:');
    checkLayers();
  }, 5000);
  
  console.log(`\n📊 Validation Results:`);
  console.log(`Total Errors: ${errorCount}`);
  console.log(`Status: ${errorCount === 0 ? '✅ ALL TESTS PASSED' : '❌ ISSUES DETECTED'}`);
  
  if (errorCount > 0) {
    console.log('\n🔧 Common Production Fixes:');
    console.log('1. Check Vite build output for missing assets');
    console.log('2. Verify API routes are properly configured');
    console.log('3. Ensure Mapbox token is valid for production domain');
    console.log('4. Check for CORS issues in production environment');
  }
  
  return errorCount === 0;
}

// Auto-run validation
validateProduction404Issues();
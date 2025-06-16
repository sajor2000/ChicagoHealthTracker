/**
 * Production Overlay Debugging Script
 * Identifies 404 errors and layer rendering issues specific to production deployment
 */

async function debugProductionOverlays() {
  console.log('🔍 Production Overlay Debug Analysis');
  console.log('=====================================');

  // 1. Test all API endpoints in production
  const endpoints = [
    '/api/health-check',
    '/api/health',
    '/api/chicago-areas/census',
    '/api/chicago-areas/community', 
    '/api/chicago-areas/wards'
  ];

  console.log('\n📡 API Endpoint Testing:');
  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint);
      const status = response.status;
      const contentType = response.headers.get('content-type');
      
      if (status === 404) {
        console.log(`❌ ${endpoint}: 404 NOT FOUND`);
      } else if (status === 200) {
        if (endpoint.includes('chicago-areas')) {
          const data = await response.json();
          console.log(`✅ ${endpoint}: ${status} (${data.features?.length || 0} features)`);
        } else {
          console.log(`✅ ${endpoint}: ${status} (${contentType})`);
        }
      } else {
        console.log(`⚠️  ${endpoint}: ${status}`);
      }
    } catch (error) {
      console.log(`❌ ${endpoint}: NETWORK ERROR - ${error.message}`);
    }
  }

  // 2. Test Mapbox token and style accessibility
  console.log('\n🗺️  Mapbox Configuration:');
  try {
    const styleUrl = 'https://api.mapbox.com/styles/v1/mapbox/dark-v11?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';
    const response = await fetch(styleUrl);
    console.log(`Mapbox style access: ${response.status}`);
    
    if (response.status === 401) {
      console.log('❌ Mapbox token unauthorized - this will cause overlay failures');
    } else if (response.status === 200) {
      console.log('✅ Mapbox style accessible');
    }
  } catch (error) {
    console.log(`❌ Mapbox style error: ${error.message}`);
  }

  // 3. Test static asset accessibility
  console.log('\n📁 Static Asset Testing:');
  const staticAssets = [
    '/assets/index.css',
    '/assets/index.js',
    '/src/components/MapContainer.tsx',
    '/src/lib/mapbox-fixed.ts'
  ];

  for (const asset of staticAssets) {
    try {
      const response = await fetch(asset);
      if (response.status === 404) {
        console.log(`❌ ${asset}: 404 NOT FOUND`);
      } else {
        console.log(`✅ ${asset}: ${response.status}`);
      }
    } catch (error) {
      console.log(`❌ ${asset}: ${error.message}`);
    }
  }

  // 4. Test CORS and mixed content issues
  console.log('\n🔒 Security & CORS Testing:');
  console.log(`Current protocol: ${window.location.protocol}`);
  console.log(`Current host: ${window.location.host}`);
  
  if (window.location.protocol === 'https:') {
    console.log('✅ HTTPS enabled');
  } else {
    console.log('⚠️  HTTP only - may cause mixed content issues');
  }

  // 5. Test layer rendering in production
  console.log('\n🎨 Layer Rendering Test:');
  
  // Simulate the exact production layer creation process
  try {
    const censusResponse = await fetch('/api/chicago-areas/census');
    if (censusResponse.status === 200) {
      const censusData = await censusResponse.json();
      console.log(`Census data loaded: ${censusData.features.length} features`);
      
      // Test data structure integrity
      const firstFeature = censusData.features[0];
      if (firstFeature && firstFeature.properties && firstFeature.geometry) {
        console.log('✅ GeoJSON structure valid');
        console.log('Sample properties:', Object.keys(firstFeature.properties).slice(0, 10));
        console.log('Geometry type:', firstFeature.geometry.type);
      } else {
        console.log('❌ Invalid GeoJSON structure');
      }
    } else {
      console.log(`❌ Census data failed: ${censusResponse.status}`);
    }
  } catch (error) {
    console.log(`❌ Census data error: ${error.message}`);
  }

  // 6. Test production-specific issues
  console.log('\n⚡ Production Environment Issues:');
  
  // Check for Vite build artifacts
  const viteManifest = document.querySelector('link[rel="manifest"]');
  if (viteManifest) {
    console.log('✅ Vite manifest found');
  } else {
    console.log('⚠️  Vite manifest missing');
  }

  // Check for service worker conflicts
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    if (registrations.length > 0) {
      console.log(`⚠️  ${registrations.length} service workers active - may cause caching issues`);
    } else {
      console.log('✅ No service worker conflicts');
    }
  }

  // Check for console errors
  console.log('\n🐛 Console Error Monitoring:');
  const originalError = console.error;
  const errors = [];
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };

  setTimeout(() => {
    console.error = originalError;
    if (errors.length > 0) {
      console.log(`❌ ${errors.length} console errors detected:`);
      errors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No console errors');
    }
  }, 5000);

  console.log('\n🔄 Overlay Flicker Analysis:');
  console.log('Common causes of production overlay failures:');
  console.log('1. Mapbox token issues (401 errors)');
  console.log('2. CORS policy blocking API calls');
  console.log('3. Missing static assets (404s)');
  console.log('4. Layer cleanup race conditions');
  console.log('5. Style loading before map initialization');
  console.log('6. Production build optimization removing layers');
  
  console.log('\n📊 Debug Complete - Check output above for specific failures');
}

// Auto-run if loaded directly
if (typeof window !== 'undefined') {
  debugProductionOverlays();
}

// Export for module use
if (typeof module !== 'undefined') {
  module.exports = { debugProductionOverlays };
}
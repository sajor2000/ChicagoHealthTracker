/**
 * Debug Hypertension Color Scaling in Browser
 * Check if enhanced color scaling is working for hypertension visualization
 */

async function debugHypertensionColors() {
  console.log('🔍 DEBUGGING HYPERTENSION COLOR SCALING');
  
  try {
    // Simulate map switching to hypertension
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
      throw new Error('No census data available');
    }
    
    // Extract hypertension rate values
    const hypertensionRates = data.features
      .map(f => f.properties.hypertension_rate)
      .filter(rate => typeof rate === 'number' && rate > 0)
      .sort((a, b) => a - b);
    
    const min = hypertensionRates[0];
    const max = hypertensionRates[hypertensionRates.length - 1];
    const range = max - min;
    const step = range / 6;
    
    console.log('\n📊 HYPERTENSION DATA ANALYSIS:');
    console.log(`Min Rate: ${min.toFixed(1)}`);
    console.log(`Max Rate: ${max.toFixed(1)}`);
    console.log(`Range: ${range.toFixed(1)}`);
    console.log(`Step Size: ${step.toFixed(1)}`);
    
    // Calculate enhanced color stops
    const colorStops = [
      min, '#16a34a',                    // Green - lowest actual values
      min + step, '#22c55e',            // Light green
      min + step * 2, '#65a30d',        // Yellow-green
      min + step * 3, '#eab308',        // Yellow
      min + step * 4, '#f97316',        // Orange
      min + step * 5, '#dc2626',        // Red
      max, '#7f1d1d'                    // Dark red - highest values
    ];
    
    console.log('\n🌈 ENHANCED COLOR SCALE:');
    console.log(`Green:       ${min.toFixed(1)} - ${(min + step).toFixed(1)}`);
    console.log(`Light Green: ${(min + step).toFixed(1)} - ${(min + step * 2).toFixed(1)}`);
    console.log(`Yellow-Green: ${(min + step * 2).toFixed(1)} - ${(min + step * 3).toFixed(1)}`);
    console.log(`Yellow:      ${(min + step * 3).toFixed(1)} - ${(min + step * 4).toFixed(1)}`);
    console.log(`Orange:      ${(min + step * 4).toFixed(1)} - ${(min + step * 5).toFixed(1)}`);
    console.log(`Red:         ${(min + step * 5).toFixed(1)} - ${max.toFixed(1)}`);
    
    // Test community areas to verify geographic patterns
    const communityResponse = await fetch('http://localhost:5000/api/chicago-areas/community');
    const communityData = await communityResponse.json();
    
    const communityRates = communityData.features
      .map(f => ({
        name: f.properties.name,
        rate: f.properties.hypertension_rate
      }))
      .filter(c => c.rate > 0)
      .sort((a, b) => a.rate - b.rate);
    
    console.log('\n🗺️  COMMUNITY HYPERTENSION VERIFICATION:');
    console.log('GREEN AREAS (should show green on map):');
    communityRates.slice(0, 3).forEach(community => {
      const colorBand = getColorBand(community.rate, min, step);
      console.log(`  ${community.name}: ${community.rate.toFixed(1)} → ${colorBand}`);
    });
    
    console.log('\nRED AREAS (should show red on map):');
    communityRates.slice(-3).forEach(community => {
      const colorBand = getColorBand(community.rate, min, step);
      console.log(`  ${community.name}: ${community.rate.toFixed(1)} → ${colorBand}`);
    });
    
    // Check if the color scale would actually show variation
    const greenAreas = hypertensionRates.filter(rate => rate <= min + step).length;
    const redAreas = hypertensionRates.filter(rate => rate >= min + step * 5).length;
    const totalAreas = hypertensionRates.length;
    
    console.log('\n📈 COLOR DISTRIBUTION:');
    console.log(`Green areas: ${greenAreas}/${totalAreas} (${(greenAreas/totalAreas*100).toFixed(1)}%)`);
    console.log(`Red areas: ${redAreas}/${totalAreas} (${(redAreas/totalAreas*100).toFixed(1)}%)`);
    
    if (greenAreas > 0 && redAreas > 0) {
      console.log('✅ Color scale should show proper green-to-red variation');
    } else {
      console.log('❌ Color scale may not show adequate variation');
    }
    
  } catch (error) {
    console.error('Error debugging hypertension colors:', error.message);
  }
}

function getColorBand(rate, min, step) {
  if (rate <= min + step) return 'GREEN';
  if (rate <= min + step * 2) return 'LIGHT GREEN';
  if (rate <= min + step * 3) return 'YELLOW-GREEN';
  if (rate <= min + step * 4) return 'YELLOW';
  if (rate <= min + step * 5) return 'ORANGE';
  return 'RED';
}

debugHypertensionColors().catch(console.error);
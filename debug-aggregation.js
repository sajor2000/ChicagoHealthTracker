import fetch from 'node-fetch';

async function debugAggregation() {
  try {
    console.log('Testing Community Areas...');
    const communityResponse = await fetch('http://localhost:5000/api/chicago-areas/community');
    const communityData = await communityResponse.json();
    
    if (communityData.features && communityData.features.length > 0) {
      const firstCommunity = communityData.features[0];
      console.log('Community Feature Properties:', Object.keys(firstCommunity.properties));
      console.log('Has diabetes_count:', firstCommunity.properties.diabetes_count);
      console.log('Has diseases object:', !!firstCommunity.properties.diseases);
      
      if (firstCommunity.properties.diseases) {
        console.log('Diseases keys:', Object.keys(firstCommunity.properties.diseases));
      }
    }
    
    console.log('\nTesting Wards...');
    const wardsResponse = await fetch('http://localhost:5000/api/chicago-areas/wards');
    const wardsData = await wardsResponse.json();
    
    if (wardsData.features && wardsData.features.length > 0) {
      const firstWard = wardsData.features[0];
      console.log('Ward Feature Properties:', Object.keys(firstWard.properties));
      console.log('Has diabetes_count:', firstWard.properties.diabetes_count);
      console.log('Has diseases object:', !!firstWard.properties.diseases);
      
      if (firstWard.properties.diseases) {
        console.log('Diseases keys:', Object.keys(firstWard.properties.diseases));
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error.message);
  }
}

debugAggregation();
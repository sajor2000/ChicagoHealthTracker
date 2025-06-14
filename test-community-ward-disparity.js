/**
 * Test Community Area and Ward Health Disparity Patterns
 * Verify green-to-red color spreading in aggregated geographic units
 */

async function testCommunityWardDisparity() {
  console.log('🧪 Testing Community Area and Ward Health Disparity Patterns\n');
  
  try {
    // Test community areas
    console.log('📍 TESTING COMMUNITY AREAS:');
    console.log('═'.repeat(80));
    
    const communityResponse = await fetch('http://localhost:5000/api/chicago-areas/community');
    const communityData = await communityResponse.json();
    
    const communities = communityData.features.map(f => ({
      name: f.properties.name,
      population: f.properties.population,
      diabetesCount: f.properties.diabetes_count,
      diabetesRate: f.properties.diabetes_rate,
      obesityCount: f.properties.obesity_count,
      obesityRate: f.properties.obesity_rate,
      demographics: f.properties.demographics
    })).filter(c => c.demographics);
    
    // Sort by diabetes rate
    communities.sort((a, b) => b.diabetesRate - a.diabetesRate);
    
    console.log('🔴 HIGHEST RISK COMMUNITIES (Top 10):');
    console.log('Name'.padEnd(25) + 'Diabetes Rate'.padEnd(15) + 'Count'.padEnd(10) + '% Black'.padEnd(10) + '% Hispanic');
    console.log('-'.repeat(75));
    
    const topCommunities = communities.slice(0, 10);
    topCommunities.forEach(community => {
      const blackPct = community.demographics ? 
        ((community.demographics.race?.black || 0) / community.population * 100).toFixed(1) : 'N/A';
      const hispanicPct = community.demographics ? 
        ((community.demographics.ethnicity?.hispanic || 0) / community.population * 100).toFixed(1) : 'N/A';
      
      console.log(
        community.name.padEnd(25) + 
        community.diabetesRate.toString().padEnd(15) + 
        community.diabetesCount.toString().padEnd(10) + 
        `${blackPct}%`.padEnd(10) + 
        `${hispanicPct}%`
      );
    });
    
    console.log('\n🟢 LOWEST RISK COMMUNITIES (Bottom 10):');
    console.log('Name'.padEnd(25) + 'Diabetes Rate'.padEnd(15) + 'Count'.padEnd(10) + '% Black'.padEnd(10) + '% Hispanic');
    console.log('-'.repeat(75));
    
    const bottomCommunities = communities.slice(-10);
    bottomCommunities.forEach(community => {
      const blackPct = community.demographics ? 
        ((community.demographics.race?.black || 0) / community.population * 100).toFixed(1) : 'N/A';
      const hispanicPct = community.demographics ? 
        ((community.demographics.ethnicity?.hispanic || 0) / community.population * 100).toFixed(1) : 'N/A';
      
      console.log(
        community.name.padEnd(25) + 
        community.diabetesRate.toString().padEnd(15) + 
        community.diabetesCount.toString().padEnd(10) + 
        `${blackPct}%`.padEnd(10) + 
        `${hispanicPct}%`
      );
    });
    
    // Calculate community statistics
    const commAvgHighRate = (topCommunities.reduce((sum, c) => sum + c.diabetesRate, 0) / topCommunities.length).toFixed(1);
    const commAvgLowRate = (bottomCommunities.reduce((sum, c) => sum + c.diabetesRate, 0) / bottomCommunities.length).toFixed(1);
    const commRateRange = (communities[0].diabetesRate - communities[communities.length - 1].diabetesRate).toFixed(1);
    
    console.log('\n📊 Community Area Statistics:');
    console.log(`Rate Range: ${communities[communities.length - 1].diabetesRate} to ${communities[0].diabetesRate} (${commRateRange} spread)`);
    console.log(`Disparity Ratio: ${(parseFloat(commAvgHighRate) / parseFloat(commAvgLowRate)).toFixed(2)}x`);
    
    // Test alderman wards
    console.log('\n\n📍 TESTING ALDERMAN WARDS:');
    console.log('═'.repeat(80));
    
    const wardResponse = await fetch('http://localhost:5000/api/chicago-areas/wards');
    const wardData = await wardResponse.json();
    
    const wards = wardData.features.map(f => ({
      name: f.properties.name,
      population: f.properties.population,
      diabetesCount: f.properties.diabetes_count,
      diabetesRate: f.properties.diabetes_rate,
      obesityCount: f.properties.obesity_count,
      obesityRate: f.properties.obesity_rate,
      demographics: f.properties.demographics
    })).filter(w => w.demographics);
    
    // Sort by diabetes rate
    wards.sort((a, b) => b.diabetesRate - a.diabetesRate);
    
    console.log('🔴 HIGHEST RISK WARDS (Top 10):');
    console.log('Ward'.padEnd(15) + 'Diabetes Rate'.padEnd(15) + 'Count'.padEnd(10) + '% Black'.padEnd(10) + '% Hispanic');
    console.log('-'.repeat(65));
    
    const topWards = wards.slice(0, 10);
    topWards.forEach(ward => {
      const blackPct = ward.demographics ? 
        ((ward.demographics.race?.black || 0) / ward.population * 100).toFixed(1) : 'N/A';
      const hispanicPct = ward.demographics ? 
        ((ward.demographics.ethnicity?.hispanic || 0) / ward.population * 100).toFixed(1) : 'N/A';
      
      console.log(
        ward.name.padEnd(15) + 
        ward.diabetesRate.toString().padEnd(15) + 
        ward.diabetesCount.toString().padEnd(10) + 
        `${blackPct}%`.padEnd(10) + 
        `${hispanicPct}%`
      );
    });
    
    console.log('\n🟢 LOWEST RISK WARDS (Bottom 10):');
    console.log('Ward'.padEnd(15) + 'Diabetes Rate'.padEnd(15) + 'Count'.padEnd(10) + '% Black'.padEnd(10) + '% Hispanic');
    console.log('-'.repeat(65));
    
    const bottomWards = wards.slice(-10);
    bottomWards.forEach(ward => {
      const blackPct = ward.demographics ? 
        ((ward.demographics.race?.black || 0) / ward.population * 100).toFixed(1) : 'N/A';
      const hispanicPct = ward.demographics ? 
        ((ward.demographics.ethnicity?.hispanic || 0) / ward.population * 100).toFixed(1) : 'N/A';
      
      console.log(
        ward.name.padEnd(15) + 
        ward.diabetesRate.toString().padEnd(15) + 
        ward.diabetesCount.toString().padEnd(10) + 
        `${blackPct}%`.padEnd(10) + 
        `${hispanicPct}%`
      );
    });
    
    // Calculate ward statistics
    const wardAvgHighRate = (topWards.reduce((sum, w) => sum + w.diabetesRate, 0) / topWards.length).toFixed(1);
    const wardAvgLowRate = (bottomWards.reduce((sum, w) => sum + w.diabetesRate, 0) / bottomWards.length).toFixed(1);
    const wardRateRange = (wards[0].diabetesRate - wards[wards.length - 1].diabetesRate).toFixed(1);
    
    console.log('\n📊 Ward Statistics:');
    console.log(`Rate Range: ${wards[wards.length - 1].diabetesRate} to ${wards[0].diabetesRate} (${wardRateRange} spread)`);
    console.log(`Disparity Ratio: ${(parseFloat(wardAvgHighRate) / parseFloat(wardAvgLowRate)).toFixed(2)}x`);
    
    // Overall assessment
    console.log('\n🎯 Color Visualization Assessment:');
    console.log('═'.repeat(50));
    
    if (parseFloat(commRateRange) > 50 && parseFloat(wardRateRange) > 50) {
      console.log('✅ SUCCESS: Both community areas and wards show wide rate ranges for good color contrast');
    } else {
      console.log('⚠️  WARNING: Rate ranges may be too narrow for good green-to-red visualization');
    }
    
    if (parseFloat(commAvgHighRate) / parseFloat(commAvgLowRate) > 1.5 && 
        parseFloat(wardAvgHighRate) / parseFloat(wardAvgLowRate) > 1.5) {
      console.log('✅ SUCCESS: Strong health disparity patterns detected in both views');
    } else {
      console.log('⚠️  WARNING: Health disparities may be too weak for clear visualization');
    }
    
    console.log(`\n✅ Community area and ward disparity test completed`);
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

testCommunityWardDisparity();
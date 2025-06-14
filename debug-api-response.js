import fetch from 'node-fetch';

async function debugApiResponse() {
  try {
    const response = await fetch('http://localhost:5000/api/chicago-areas/census');
    const data = await response.json();
    
    console.log('API Response Status:', response.status);
    console.log('Feature Count:', data.features.length);
    
    if (data.features.length > 0) {
      const firstFeature = data.features[0];
      const props = firstFeature.properties;
      
      console.log('\nFirst Feature Properties:');
      console.log('ID:', props.id);
      console.log('Population:', props.population);
      
      console.log('\nDisease Properties Check:');
      console.log('Has diseases object:', !!props.diseases);
      console.log('Has diabetes_count:', props.diabetes_count);
      console.log('Has diabetes_rate:', props.diabetes_rate);
      console.log('Has hypertension_count:', props.hypertension_count);
      console.log('Has hypertension_rate:', props.hypertension_rate);
      
      console.log('\nAll Property Keys:');
      console.log(Object.keys(props).filter(k => k.includes('diabetes') || k.includes('hypertension')));
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugApiResponse();
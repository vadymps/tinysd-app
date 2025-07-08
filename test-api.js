const axios = require('axios');

async function testModelsLabAPI() {
  try {
    console.log('Testing ModelsLab API...');
    
    const response = await axios.post('https://modelslab.com/api/v6/realtime/text2img', {
      key: 'fYZgDGKGGNBJfzzyZ1ZNnCg6E2CrYULxlbfmxXQwZj8XdKIlIaxbGgZuwQrE',
      prompt: 'a simple test',
      negative_prompt: '',
      width: '512',
      height: '512',
      samples: '1',
      num_inference_steps: '20',
      guidance_scale: 7.5,
      scheduler: 'EulerAncestralDiscrete'
    }, {
      timeout: 30000 // 30 second timeout
    });
    
    console.log('API Response Status:', response.status);
    console.log('API Response Data:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('API Error:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testModelsLabAPI();

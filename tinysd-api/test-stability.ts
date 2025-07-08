import axios from 'axios';
import FormData from 'form-data';

async function testStabilityAI() {
  const payload = {
    prompt: 'a beautiful lighthouse on a cliff overlooking the ocean',
    output_format: 'webp'
  };

  try {
    console.log('Testing Stability AI API...');
    console.log('Payload:', payload);

    const response = await axios.postForm(
      'https://api.stability.ai/v2beta/stable-image/generate/ultra',
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          Authorization: 'Bearer sk-2G1nuf2Bo1JPrU7UsHdkdj8VFEnsxAJ3uZGh9kGdpmyUV5Lw',
          Accept: 'image/*',
        },
      },
    );

    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    
    if (response.status === 200) {
      console.log('✅ Success! Image generated');
      console.log('Image size:', response.data.byteLength, 'bytes');
    } else {
      console.log('❌ Error:', response.status);
      console.log('Error response:', response.data.toString());
    }
  } catch (error: any) {
    console.error('❌ Exception:', error.message);
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response data:', error.response.data?.toString());
    }
  }
}

testStabilityAI();

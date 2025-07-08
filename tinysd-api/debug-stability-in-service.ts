import axios from 'axios';
import FormData from 'form-data';

// Test the exact implementation used in the service
async function testStabilityServicePattern() {
  const prompt = 'a beautiful lighthouse on a cliff overlooking the ocean';
  const apiUrl = 'https://api.stability.ai/v2beta/stable-image/generate/ultra';
  const apiKey = 'sk-2G1nuf2Bo1JPrU7UsHdkdj8VFEnsxAJ3uZGh9kGdpmyUV5Lw';

  const payload = {
    prompt,
    output_format: 'webp',
  };

  console.log('Testing Stability AI Service Pattern...');
  console.log('Payload:', payload);
  console.log('API URL:', apiUrl);
  console.log('API Key:', apiKey.substring(0, 10) + '...');

  try {
    const response = await axios.postForm(
      apiUrl,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${apiKey}`,
          Accept: 'image/*',
        },
      },
    );

    console.log('Response Status:', response.status);
    console.log('Response Headers:', response.headers);

    if (response.status === 200) {
      const base64Image = Buffer.from(response.data).toString('base64');
      const dataUrl = `data:image/webp;base64,${base64Image}`;
      console.log('✅ Success! Base64 image length:', base64Image.length);
      console.log('✅ Data URL length:', dataUrl.length);
      console.log('✅ Image size in bytes:', response.data.byteLength);
    } else {
      const errorText = Buffer.from(response.data).toString();
      console.log('❌ Error Response:', errorText);
    }
  } catch (error: any) {
    console.log('❌ Exception:', error.message);
    if (error.response) {
      console.log('Error Status:', error.response.status);
      console.log('Error Data:', Buffer.from(error.response.data || '').toString());
    }
  }
}

testStabilityServicePattern();

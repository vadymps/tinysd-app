import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedMultipleProviders() {
  const client = new MongoClient(process.env.DB_CONN_STRING!);

  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection('image_settings');

    // Deactivate all existing settings
    await collection.updateMany({}, { $set: { isActive: false } });

    // Delete any existing default settings to avoid conflicts
    await collection.deleteMany({
      $or: [{ provider: 'modelslab' }, { provider: 'stability_ai' }],
    });

    const providers = [
      {
        provider: 'modelslab',
        providerName: 'ModelsLab',
        apiKey: 'b58gdMaF3Dky32IuLiM9zh0ojgRsMXfcJGZkWhzZP35n0Z6aKlHHfw2sjDVe',
        apiUrl: 'https://modelslab.com/api/v6/realtime/text2img',
        defaultNegativePrompt: '',
        defaultWidth: '512',
        defaultHeight: '512',
        defaultSamples: '1',
        defaultNumInferenceSteps: '30',
        defaultGuidanceScale: 7.5,
        defaultScheduler: 'EulerAncestralDiscrete',
        defaultSeed: null,
        isActive: false, // Not active by default since ModelsLab is down
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        provider: 'stability_ai',
        providerName: 'Stability AI',
        apiKey: 'YOUR_STABILITY_AI_API_KEY_HERE', // User needs to replace this
        apiUrl: 'https://api.stability.ai/v2beta/stable-image/generate/core',
        defaultNegativePrompt: '',
        defaultWidth: '1024',
        defaultHeight: '1024',
        defaultSamples: '1',
        defaultNumInferenceSteps: '30',
        defaultGuidanceScale: 7.5,
        defaultScheduler: 'EulerAncestralDiscrete',
        defaultSeed: null,
        isActive: true, // Set as active by default
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await collection.insertMany(providers);
    console.log(
      `Successfully inserted ${result.insertedCount} provider settings`,
    );

    console.log('\\nProvider settings created:');
    console.log(
      '1. ModelsLab (inactive) - Set as backup when service is restored',
    );
    console.log(
      '2. Stability AI (active) - Replace YOUR_STABILITY_AI_API_KEY_HERE with your actual API key',
    );
    console.log(
      '\\nTo switch providers, update the isActive field in the database or use the API endpoints.',
    );
  } catch (error) {
    console.error('Error seeding provider settings:', error);
  } finally {
    await client.close();
  }
}

seedMultipleProviders();

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ImageSettingsService } from '../image/services/image-settings.service';

async function seedImageSettings() {
  const app = await NestFactory.create(AppModule);
  const imageSettingsService = app.get(ImageSettingsService);

  try {
    // Check if there are any existing settings
    const existingSettings = await imageSettingsService.findAll();

    if (existingSettings.length === 0) {
      console.log('No image settings found. Creating default settings...');

      // Create default settings
      const defaultSettings = {
        provider: 'modelslab' as any,
        providerName: 'ModelsLab',
        apiKey: 'hmW6iEQ1NbEFauqLjgONoWPZ8SILCwoHwiXlc5tmYejHVfK5i7s8VwLZaTfC',
        apiUrl: 'https://modelslab.com/api/v6/realtime/text2img',
        defaultNegativePrompt: '',
        defaultWidth: '512',
        defaultHeight: '512',
        defaultSamples: '1',
        defaultNumInferenceSteps: '30',
        defaultGuidanceScale: 7.5,
        defaultScheduler: 'EulerAncestralDiscrete',
        isActive: true,
      };

      const createdSettings =
        await imageSettingsService.create(defaultSettings);
      console.log('Default image settings created:', createdSettings.id);
    } else {
      console.log(`Found ${existingSettings.length} existing image settings.`);
      const activeSettings = existingSettings.find((s) => s.isActive);
      if (activeSettings) {
        console.log('Active settings ID:', activeSettings.id);

        // Update the active settings with the working API key
        await imageSettingsService.update(activeSettings.id, {
          apiKey:
            'hmW6iEQ1NbEFauqLjgONoWPZ8SILCwoHwiXlc5tmYejHVfK5i7s8VwLZaTfC',
        });
        console.log('Updated active settings with working API key');
      } else {
        console.log('No active settings found. You may need to activate one.');
      }
    }
  } catch (error) {
    console.error('Error seeding image settings:', error);
  } finally {
    await app.close();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedImageSettings()
    .then(() => {
      console.log('Image settings seed completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Image settings seed failed:', error);
      process.exit(1);
    });
}

export { seedImageSettings };

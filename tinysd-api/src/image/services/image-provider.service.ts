import { Injectable } from '@nestjs/common';
import axios from 'axios';
import FormData from 'form-data';
import {
  ImageProvider,
  ImageSettings,
} from '../entities/image-settings.entity';
import { GenerateImageDto } from '../dto/image.dto';

export interface ProviderResponse {
  success: boolean;
  imageUrl?: string;
  data?: any;
  error?: string;
}

@Injectable()
export class ImageProviderService {
  async generateImage(
    settings: ImageSettings,
    generateImageDto: GenerateImageDto,
  ): Promise<ProviderResponse> {
    try {
      switch (settings.provider) {
        case ImageProvider.MODELSLAB:
          return await this.generateWithModelsLab(settings, generateImageDto);
        case ImageProvider.STABILITY_AI:
          return await this.generateWithStabilityAI(settings, generateImageDto);
        default:
          throw new Error(`Unsupported provider: ${settings.provider}`);
      }
    } catch (error: any) {
      console.error(`Provider ${settings.provider} error:`, error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  private async generateWithModelsLab(
    settings: ImageSettings,
    generateImageDto: GenerateImageDto,
  ): Promise<ProviderResponse> {
    const {
      prompt,
      negative_prompt = settings.defaultNegativePrompt,
      width = settings.defaultWidth,
      height = settings.defaultHeight,
      samples = settings.defaultSamples,
      num_inference_steps = settings.defaultNumInferenceSteps,
      guidance_scale = settings.defaultGuidanceScale,
      scheduler = settings.defaultScheduler,
      seed = settings.defaultSeed,
    } = generateImageDto;

    const response = await axios.post(
      settings.apiUrl,
      {
        key: settings.apiKey,
        prompt,
        negative_prompt,
        width,
        height,
        samples,
        num_inference_steps,
        guidance_scale,
        scheduler,
        seed,
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      success: true,
      imageUrl: response.data?.output?.[0] || '',
      data: response.data,
    };
  }

  private async generateWithStabilityAI(
    settings: ImageSettings,
    generateImageDto: GenerateImageDto,
  ): Promise<ProviderResponse> {
    const { prompt } = generateImageDto;

    // Create form data payload for Stability AI
    const payload = {
      prompt,
      output_format: 'webp', // Use webp for better compression
    };

    const response = await axios.postForm(
      settings.apiUrl,
      axios.toFormData(payload, new FormData()),
      {
        validateStatus: undefined,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          Accept: 'image/*',
        },
      },
    );

    if (response.status === 200) {
      // Convert the binary image data to base64 for JSON response
      const base64Image = Buffer.from(response.data).toString('base64');
      const dataUrl = `data:image/webp;base64,${base64Image}`;

      return {
        success: true,
        imageUrl: dataUrl,
        data: {
          image: dataUrl,
          format: 'webp',
          size: response.data.byteLength,
        },
      };
    } else {
      const errorText = Buffer.from(response.data).toString();
      throw new Error(`${response.status}: ${errorText}`);
    }
  }
}

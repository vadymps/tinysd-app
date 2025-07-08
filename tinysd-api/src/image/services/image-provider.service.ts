import { Injectable } from '@nestjs/common';
import axios from 'axios';
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

    // Convert dimensions for Stability AI aspect ratio
    const width = parseInt(settings.defaultWidth) || 512;
    const height = parseInt(settings.defaultHeight) || 512;
    let aspectRatio = '1:1'; // default

    if (width > height) {
      aspectRatio = width / height > 1.5 ? '16:9' : '3:2';
    } else if (height > width) {
      aspectRatio = height / width > 1.5 ? '9:16' : '2:3';
    }

    const response = await axios.post(
      settings.apiUrl,
      {
        prompt,
        aspect_ratio: aspectRatio,
        output_format: 'jpeg',
      },
      {
        timeout: 30000,
        headers: {
          Authorization: `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    return {
      success: true,
      imageUrl:
        response.data?.image || response.data?.artifacts?.[0]?.base64 || '',
      data: response.data,
    };
  }
}

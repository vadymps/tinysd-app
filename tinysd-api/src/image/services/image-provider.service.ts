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
        case ImageProvider.GOOGLE_GEMINI:
          return await this.generateWithGoogleGemini(settings, generateImageDto);
        case ImageProvider.HUGGINGFACE_INFERENCE:
          return await this.generateWithHuggingFaceInference(
            settings,
            generateImageDto,
          );
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

    const form = new FormData();
    form.append('prompt', prompt);
    form.append('aspect_ratio', aspectRatio);
    form.append('output_format', 'png');

    const response = await axios.post(settings.apiUrl, form, {
      timeout: 30000,
      headers: {
        Authorization: `Bearer ${settings.apiKey}`,
        Accept: 'application/json',
        ...form.getHeaders(),
      },
    });

    const rawBase64 =
      response.data?.image || response.data?.artifacts?.[0]?.base64 || '';
    const normalizedImageUrl = rawBase64
      ? rawBase64.startsWith('data:')
        ? rawBase64
        : `data:image/png;base64,${rawBase64}`
      : '';

    return {
      success: true,
      imageUrl: normalizedImageUrl,
      data: response.data,
    };
  }

  private async generateWithGoogleGemini(
    settings: ImageSettings,
    generateImageDto: GenerateImageDto,
  ): Promise<ProviderResponse> {
    const { prompt, negative_prompt } = generateImageDto;
    const fullPrompt = negative_prompt
      ? `${prompt}\n\nDo not include: ${negative_prompt}`
      : prompt;

    const aspectRatio = this.getAspectRatio(
      settings.defaultWidth,
      settings.defaultHeight,
    );

    const imageSize = this.getImageSize(
      settings.defaultWidth,
      settings.defaultHeight,
    );

    const response = await axios.post(
      settings.apiUrl,
      {
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          responseModalities: ['Image'],
          ...(aspectRatio || imageSize
            ? {
                imageConfig: {
                  ...(aspectRatio ? { aspectRatio } : {}),
                  ...(imageSize ? { imageSize } : {}),
                },
              }
            : {}),
        },
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': settings.apiKey,
        },
      },
    );

    const parts = response.data?.candidates?.[0]?.content?.parts || [];
    const inlinePart = parts.find((part: any) => part.inlineData?.data);
    const base64 = inlinePart?.inlineData?.data || '';
    const mimeType = inlinePart?.inlineData?.mimeType || 'image/png';

    if (!base64) {
      return {
        success: false,
        error: 'No image data returned by Gemini',
        data: response.data,
      };
    }

    return {
      success: true,
      imageUrl: `data:${mimeType};base64,${base64}`,
      data: response.data,
    };
  }

  private getAspectRatio(width?: string, height?: string): string | undefined {
    const w = parseInt(width || '', 10);
    const h = parseInt(height || '', 10);
    if (!w || !h) return undefined;

    const ratio = w / h;
    const options: Array<{ ratio: number; label: string }> = [
      { ratio: 1 / 1, label: '1:1' },
      { ratio: 2 / 3, label: '2:3' },
      { ratio: 3 / 2, label: '3:2' },
      { ratio: 3 / 4, label: '3:4' },
      { ratio: 4 / 3, label: '4:3' },
      { ratio: 9 / 16, label: '9:16' },
      { ratio: 16 / 9, label: '16:9' },
      { ratio: 1 / 4, label: '1:4' },
      { ratio: 1 / 8, label: '1:8' },
    ];

    let best = options[0];
    let bestDelta = Math.abs(ratio - best.ratio);
    for (const option of options) {
      const delta = Math.abs(ratio - option.ratio);
      if (delta < bestDelta) {
        best = option;
        bestDelta = delta;
      }
    }
    return best.label;
  }

  private getImageSize(
    width?: string,
    height?: string,
  ): '1K' | '2K' | undefined {
    const w = parseInt(width || '', 10);
    const h = parseInt(height || '', 10);
    if (!w || !h) return undefined;
    const maxDim = Math.max(w, h);
    if (maxDim >= 2048) return '2K';
    if (maxDim >= 1024) return '1K';
    return undefined;
  }

  private async generateWithHuggingFaceInference(
    settings: ImageSettings,
    generateImageDto: GenerateImageDto,
  ): Promise<ProviderResponse> {
    const {
      prompt,
      negative_prompt = settings.defaultNegativePrompt,
      num_inference_steps = settings.defaultNumInferenceSteps,
      guidance_scale = settings.defaultGuidanceScale,
      seed = settings.defaultSeed,
      width = settings.defaultWidth,
      height = settings.defaultHeight,
    } = generateImageDto;

    const parameters: Record<string, any> = {};
    if (negative_prompt) parameters.negative_prompt = negative_prompt;
    if (num_inference_steps)
      parameters.num_inference_steps = parseInt(num_inference_steps, 10);
    if (typeof guidance_scale === 'number')
      parameters.guidance_scale = guidance_scale;
    if (typeof seed === 'number') parameters.seed = seed;

    const widthNum = parseInt(width || '', 10);
    const heightNum = parseInt(height || '', 10);
    if (Number.isFinite(widthNum)) parameters.width = widthNum;
    if (Number.isFinite(heightNum)) parameters.height = heightNum;

    let response;
    try {
      response = await axios.post(
        settings.apiUrl,
        {
          inputs: prompt,
          parameters,
        },
        {
          timeout: 60000,
          responseType: 'arraybuffer',
          headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
            Accept: 'image/png',
          },
        },
      );
    } catch (error: any) {
      throw new Error(this.formatAxiosError(error));
    }

    const contentType =
      response.headers?.['content-type'] || 'application/octet-stream';
    const base64 = Buffer.from(response.data).toString('base64');

    return {
      success: true,
      imageUrl: `data:${contentType};base64,${base64}`,
      data: {
        contentType,
      },
    };
  }

  private formatAxiosError(error: any): string {
    const status = error?.response?.status;
    let details = '';
    const data = error?.response?.data;

    if (Buffer.isBuffer(data)) {
      details = data.toString('utf8');
    } else if (typeof data === 'string') {
      details = data;
    } else if (data) {
      try {
        details = JSON.stringify(data);
      } catch {
        details = String(data);
      }
    } else if (error?.message) {
      details = error.message;
    }

    return status ? `HTTP ${status}: ${details}` : details || 'Unknown error';
  }
}

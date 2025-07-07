import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { GenerateImageDto } from './dto/image.dto';

@Injectable()
export class ImageService {
  constructor(private readonly configService: ConfigService) {}

  async generateImage(generateImageDto: GenerateImageDto) {
    try {
      const {
        prompt,
        negative_prompt = '',
        width = '512',
        height = '512',
        samples = '1',
        num_inference_steps = '30',
        guidance_scale = 7.5,
        scheduler = 'EulerAncestralDiscrete',
        seed = null,
      } = generateImageDto;

      const response = await axios.post(
        'https://modelslab.com/api/v6/realtime/text2img',
        {
          key: 'hmW6iEQ1NbEFauqLjgONoWPZ8SILCwoHwiXlc5tmYejHVfK5i7s8VwLZaTfC',
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
      );

      return response.data;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to generate image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

import { Controller, Post, Body } from '@nestjs/common';
import { ImageService } from './image.service';
import { GenerateImageDto } from './dto/image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('generate')
  async generateImage(@Body() generateImageDto: GenerateImageDto) {
    return this.imageService.generateImage(generateImageDto);
  }
}

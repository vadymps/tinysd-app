import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  Res,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import { ImageService } from './image.service';
import { GenerateImageDto } from './dto/image.dto';
import { SaveImageDto } from './dto/saved-image.dto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('generate')
  async generateImage(@Body() generateImageDto: GenerateImageDto) {
    return this.imageService.generateImage(generateImageDto);
  }

  @Post('save')
  async saveImage(@Body() saveImageDto: SaveImageDto) {
    return this.imageService.saveImage(saveImageDto);
  }

  @Get('saved')
  async getSavedImages() {
    return this.imageService.getSavedImages();
  }

  @Get('saved/:filename')
  serveImage(@Param('filename') filename: string, @Res() res: Response) {
    try {
      const imagePath = this.imageService.getSavedImagePath(filename);

      if (!fs.existsSync(imagePath)) {
        throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
      }

      res.sendFile(imagePath);
    } catch {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }

  @Get('generated/:filename')
  serveGeneratedImage(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const imagePath = this.imageService.getSavedImagePath(filename);

      if (!fs.existsSync(imagePath)) {
        throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
      }

      res.sendFile(imagePath);
    } catch {
      throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
    }
  }

  @Delete('saved/:id')
  async deleteSavedImage(@Param('id') id: string) {
    await this.imageService.deleteSavedImage(id);
    return { message: 'Image deleted successfully' };
  }
}

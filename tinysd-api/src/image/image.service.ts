import {
  Injectable,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Collection, ObjectId } from 'mongodb';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { GenerateImageDto } from './dto/image.dto';
import { SaveImageDto, SavedImageDto } from './dto/saved-image.dto';
import { SavedImage } from './entities/saved-image.entity';
import { LogsService } from '../logs/logs.service';
import { ImageSettingsService } from './services/image-settings.service';
import { ImageProviderService } from './services/image-provider.service';

@Injectable()
export class ImageService {
  private readonly imagesDir = path.join(process.cwd(), 'saved-images');

  constructor(
    private readonly configService: ConfigService,
    private readonly logsService: LogsService,
    private readonly imageSettingsService: ImageSettingsService,
    private readonly imageProviderService: ImageProviderService,
    @Inject('SAVED_IMAGES_COLLECTION')
    private savedImagesCollection: Collection,
  ) {
    // Ensure images directory exists
    if (!fs.existsSync(this.imagesDir)) {
      fs.mkdirSync(this.imagesDir, { recursive: true });
    }
  }

  async generateImage(generateImageDto: GenerateImageDto) {
    try {
      // Get active settings from database
      const settings = await this.imageSettingsService.getActiveSettings();
      console.log('Using provider:', {
        provider: settings.provider,
        providerName: settings.providerName,
        apiUrl: settings.apiUrl,
        apiKey: settings.apiKey.substring(0, 10) + '...',
      });

      // Use the provider service to generate the image
      const providerResponse = await this.imageProviderService.generateImage(
        settings,
        generateImageDto,
      );

      if (!providerResponse.success) {
        // Log the API error
        try {
          await this.logsService.create({
            referer: 'Image Generator',
            datetime: Date.now(),
            action: 'api_error',
            prompt: generateImageDto.prompt,
            imageUrl: '',
            error: providerResponse.error,
            provider: settings.provider,
            providerName: settings.providerName,
          });
        } catch (logError) {
          console.error('Failed to log API error:', logError);
        }

        throw new Error(providerResponse.error || 'Image generation failed');
      }

      console.log(
        'Image generated successfully with provider:',
        settings.provider,
      );

      // Log the image generation
      try {
        await this.logsService.create({
          referer: 'Image Generator',
          datetime: Date.now(),
          action: 'generate',
          prompt: generateImageDto.prompt,
          imageUrl: providerResponse.imageUrl || '',
        });
      } catch (logError) {
        // Don't fail the image generation if logging fails
        console.error('Failed to log image generation:', logError);
      }

      return providerResponse.data;
    } catch (error: any) {
      console.error('Image generation error:', error.message);

      // Log the general error
      try {
        const settings = await this.imageSettingsService.getActiveSettings();
        await this.logsService.create({
          referer: 'Image Generator',
          datetime: Date.now(),
          action: 'generation_error',
          prompt: generateImageDto.prompt,
          imageUrl: '',
          error: error.message || 'Unknown error',
          provider: settings.provider,
          providerName: settings.providerName,
        });
      } catch (logError) {
        console.error('Failed to log generation error:', logError);
      }

      throw new HttpException(
        error.message || 'Failed to generate image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveImage(saveImageDto: SaveImageDto): Promise<SavedImageDto> {
    try {
      const { imageUrl, prompt } = saveImageDto;

      // Download the image
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
      });
      const buffer = Buffer.from(response.data);

      // Generate filename
      const timestamp = Date.now();
      const filename = `image_${timestamp}.jpg`;
      const localPath = path.join(this.imagesDir, filename);

      // Save file to disk
      fs.writeFileSync(localPath, buffer);

      // Save metadata to database
      const savedImage = new SavedImage(
        filename,
        imageUrl,
        prompt,
        new Date(),
        localPath,
      );

      const result = await this.savedImagesCollection.insertOne(savedImage);

      // Log the image save
      try {
        await this.logsService.create({
          referer: 'Image Gallery',
          datetime: Date.now(),
          action: 'save',
          prompt,
          imageUrl,
          imageName: filename,
        });
      } catch (logError) {
        // Don't fail the save if logging fails
        console.error('Failed to log image save:', logError);
      }

      return {
        id: result.insertedId.toString(),
        filename,
        originalUrl: imageUrl,
        prompt,
        savedAt: savedImage.savedAt,
        localPath: `/api/image/saved/${filename}`,
      };
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to save image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getSavedImages(): Promise<SavedImageDto[]> {
    try {
      const savedImages = await this.savedImagesCollection.find({}).toArray();

      return savedImages.map((img) => ({
        id: img._id.toString(),
        filename: img.filename,
        originalUrl: img.originalUrl,
        prompt: img.prompt,
        savedAt: img.savedAt,
        localPath: `/api/image/saved/${img.filename}`,
      }));
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to get saved images',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteSavedImage(id: string): Promise<void> {
    try {
      const objectId = new ObjectId(id);
      const savedImage = await this.savedImagesCollection.findOne({
        _id: objectId,
      });

      if (!savedImage) {
        throw new HttpException('Image not found', HttpStatus.NOT_FOUND);
      }

      // Delete file from disk
      if (fs.existsSync(savedImage.localPath)) {
        fs.unlinkSync(savedImage.localPath);
      }

      // Delete from database
      await this.savedImagesCollection.deleteOne({ _id: objectId });

      // Log the image deletion
      try {
        await this.logsService.create({
          referer: 'Image Gallery',
          datetime: Date.now(),
          action: 'delete',
          prompt: savedImage.prompt,
          imageName: savedImage.filename,
        });
      } catch (logError) {
        // Don't fail the delete if logging fails
        console.error('Failed to log image deletion:', logError);
      }
    } catch (error: any) {
      throw new HttpException(
        error.message || 'Failed to delete image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  getSavedImagePath(filename: string): string {
    return path.join(this.imagesDir, filename);
  }
}

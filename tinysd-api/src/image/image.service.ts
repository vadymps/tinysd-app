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

      // Handle different response formats
      let imageUrl = providerResponse.imageUrl;
      let responseData = providerResponse.data;

      // If the response contains a base64 data URL, save it as a file
      if (
        providerResponse.imageUrl &&
        providerResponse.imageUrl.startsWith('data:')
      ) {
        const result = await this.saveBase64Image(providerResponse.imageUrl);
        imageUrl = result.imageUrl;
        responseData = {
          ...providerResponse.data,
          imageUrl: result.imageUrl,
          output: [result.imageUrl], // For compatibility with existing UI
        };
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
          imageUrl: imageUrl || '',
        });
      } catch (logError) {
        // Don't fail the image generation if logging fails
        console.error('Failed to log image generation:', logError);
      }

      return responseData;
    } catch (error: any) {
      console.error('Image generation error:', error.message);
      throw new HttpException(
        error.message || 'Failed to generate image',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveImage(saveImageDto: SaveImageDto): Promise<SavedImageDto> {
    try {
      const { imageUrl, prompt } = saveImageDto;
      let buffer: Buffer;
      let filename: string;
      let localPath: string;

      if (imageUrl.startsWith('data:')) {
        // Handle base64 data URL
        const matches = imageUrl.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
        if (!matches) {
          throw new Error('Invalid data URL format');
        }

        const format = matches[1];
        const base64Data = matches[2];
        buffer = Buffer.from(base64Data, 'base64');

        // Generate filename
        const timestamp = Date.now();
        filename = `image_${timestamp}.${format}`;
        localPath = path.join(this.imagesDir, filename);
      } else {
        // Handle regular URL
        const response = await axios.get(imageUrl, {
          responseType: 'arraybuffer',
        });
        buffer = Buffer.from(response.data);

        // Generate filename
        const timestamp = Date.now();
        filename = `image_${timestamp}.jpg`;
        localPath = path.join(this.imagesDir, filename);
      }

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

  private saveBase64Image(
    dataUrl: string,
  ): Promise<{ imageUrl: string; format: string }> {
    try {
      // Extract the format and base64 data from the data URL
      const matches = dataUrl.match(/^data:image\/([a-zA-Z]*);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid data URL format');
      }

      const format = matches[1]; // webp, jpeg, png, etc.
      const base64Data = matches[2];

      // Generate filename
      const timestamp = Date.now();
      const filename = `generated_${timestamp}.${format}`;
      const filePath = path.join(this.imagesDir, filename);

      // Convert base64 to buffer and save file
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      console.log(`Saved base64 image to: ${filePath}`);

      // Return the URL that can be served by the static file endpoint
      const imageUrl = `http://localhost:3000/api/image/generated/${filename}`;

      return Promise.resolve({
        imageUrl,
        format,
      });
    } catch (error) {
      console.error('Error saving base64 image:', error);
      throw new Error('Failed to save generated image');
    }
  }
}

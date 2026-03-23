import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { GenerateImageDto } from '../dto/image.dto';
import { SaveImageDto, SavedImageDto } from '../dto/saved-image.dto';
import { SavedImage } from '../entities/saved-image.entity';
import { LogsService } from '../../logs/services/logs.service';
import { ImageSettingsService } from './image-settings.service';
import { ImageProviderService } from './image-provider.service';

@Injectable()
export class ImageService {
  private readonly imagesDir = path.join(process.cwd(), 'saved-images');
  private readonly cloudinaryEnabled: boolean;
  private readonly cloudinaryFolder?: string;

  constructor(
    private readonly logsService: LogsService,
    private readonly imageSettingsService: ImageSettingsService,
    private readonly imageProviderService: ImageProviderService,
    @Inject('SAVED_IMAGES_COLLECTION')
    private savedImagesCollection: Collection,
  ) {
    this.cloudinaryEnabled = this.hasCloudinaryConfig();
    this.cloudinaryFolder = process.env.CLOUDINARY_FOLDER?.trim() || undefined;
    if (this.cloudinaryEnabled) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }

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
      let buffer: Buffer | null = null;
      let filename: string;
      let localPath: string;
      let isCloudinary = false;

      if (imageUrl.startsWith('/api/image/generated/')) {
        // Image already saved locally by generator
        filename = imageUrl.split('/').pop() || '';
        if (!filename) {
          throw new Error('Invalid generated image URL');
        }
        localPath = path.join(this.imagesDir, filename);
        if (!fs.existsSync(localPath)) {
          throw new Error('Generated image not found on disk');
        }
        if (this.cloudinaryEnabled) {
          const publicId = `saved_${Date.now()}`;
          const uploadResult = await this.uploadToCloudinary(localPath, publicId);
          filename = uploadResult.public_id;
          localPath = uploadResult.secure_url;
          isCloudinary = true;
        }
      } else if (imageUrl.startsWith('data:')) {
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

        if (this.cloudinaryEnabled) {
          const dataUrl = `data:image/${format};base64,${base64Data}`;
          const publicId = `saved_${timestamp}`;
          const uploadResult = await this.uploadToCloudinary(dataUrl, publicId);
          filename = uploadResult.public_id;
          localPath = uploadResult.secure_url;
          isCloudinary = true;
          buffer = null;
        }
      } else {
        // Handle regular URL
        const timestamp = Date.now();
        filename = `image_${timestamp}.jpg`;
        localPath = path.join(this.imagesDir, filename);

        if (this.cloudinaryEnabled) {
          const publicId = `saved_${timestamp}`;
          const uploadResult = await this.uploadToCloudinary(imageUrl, publicId);
          filename = uploadResult.public_id;
          localPath = uploadResult.secure_url;
          isCloudinary = true;
        } else {
          const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
          });
          buffer = Buffer.from(response.data);
        }
      }

      // Save file to disk if we generated a new buffer
      if (buffer) {
        fs.writeFileSync(localPath, buffer);
      }

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
        localPath: isCloudinary ? localPath : `/api/image/saved/${filename}`,
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
        localPath:
          img.localPath?.startsWith('http://') ||
          img.localPath?.startsWith('https://')
            ? img.localPath
            : `/api/image/saved/${img.filename}`,
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

      const isRemote =
        savedImage.localPath?.startsWith('http://') ||
        savedImage.localPath?.startsWith('https://');

      if (isRemote) {
        if (!this.cloudinaryEnabled) {
          throw new HttpException(
            'Cloudinary is not configured to delete this image',
            HttpStatus.BAD_REQUEST,
          );
        }
        await cloudinary.uploader.destroy(savedImage.filename);
      } else {
        // Delete file from disk
        if (fs.existsSync(savedImage.localPath)) {
          fs.unlinkSync(savedImage.localPath);
        }
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

  private async saveBase64Image(
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

      const timestamp = Date.now();

      if (this.cloudinaryEnabled) {
        const publicId = `generated_${timestamp}`;
        const uploadResult = await this.uploadToCloudinary(dataUrl, publicId);
        return {
          imageUrl: uploadResult.secure_url,
          format,
        };
      }

      // Generate filename
      const filename = `generated_${timestamp}.${format}`;
      const filePath = path.join(this.imagesDir, filename);

      // Convert base64 to buffer and save file
      const buffer = Buffer.from(base64Data, 'base64');
      fs.writeFileSync(filePath, buffer);

      console.log(`Saved base64 image to: ${filePath}`);

      // Return a relative URL so it works from any client origin
      const imageUrl = `/api/image/generated/${filename}`;

      return {
        imageUrl,
        format,
      };
    } catch (error) {
      console.error('Error saving base64 image:', error);
      throw new Error('Failed to save generated image');
    }
  }

  private hasCloudinaryConfig(): boolean {
    return Boolean(
      process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET,
    );
  }

  private async uploadToCloudinary(
    source: string,
    publicId: string,
  ): Promise<{ public_id: string; secure_url: string }> {
    const options: Record<string, string> = {
      public_id: publicId,
    };

    if (this.cloudinaryFolder) {
      options.folder = this.cloudinaryFolder;
    }

    const result = await cloudinary.uploader.upload(source, options);
    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
    };
  }
}

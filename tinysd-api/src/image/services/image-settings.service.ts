import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import {
  CreateImageSettingsDto,
  UpdateImageSettingsDto,
  ImageSettingsDto,
} from '../dto/image-settings.dto';
import {
  ImageSettings,
  ImageProvider,
} from '../entities/image-settings.entity';

@Injectable()
export class ImageSettingsService {
  constructor(
    @Inject('IMAGE_SETTINGS_COLLECTION')
    private imageSettingsCollection: Collection,
  ) {}

  async getActiveSettings(): Promise<ImageSettingsDto> {
    const settings = await this.imageSettingsCollection.findOne({
      isActive: true,
    });

    if (!settings) {
      // Return default settings if none found
      return this.getDefaultSettings();
    }

    return this.mapToDto(settings);
  }

  async findAll(): Promise<ImageSettingsDto[]> {
    const settings = await this.imageSettingsCollection.find({}).toArray();
    return settings.map((setting) => this.mapToDto(setting));
  }

  async findOne(id: string): Promise<ImageSettingsDto> {
    const objectId = new ObjectId(id);
    const settings = await this.imageSettingsCollection.findOne({
      _id: objectId,
    });

    if (!settings) {
      throw new NotFoundException(`Settings with id ${id} not found`);
    }

    return this.mapToDto(settings);
  }

  async create(
    createImageSettingsDto: CreateImageSettingsDto,
  ): Promise<ImageSettingsDto> {
    // If this is set as active, deactivate all others
    if (createImageSettingsDto.isActive) {
      await this.imageSettingsCollection.updateMany(
        {},
        { $set: { isActive: false } },
      );
    }

    const settings = new ImageSettings(
      createImageSettingsDto.provider,
      createImageSettingsDto.providerName,
      createImageSettingsDto.apiKey,
      createImageSettingsDto.apiUrl,
      createImageSettingsDto.defaultNegativePrompt || '',
      createImageSettingsDto.defaultWidth || '512',
      createImageSettingsDto.defaultHeight || '512',
      createImageSettingsDto.defaultSamples || '1',
      createImageSettingsDto.defaultNumInferenceSteps || '30',
      createImageSettingsDto.defaultGuidanceScale || 7.5,
      createImageSettingsDto.defaultScheduler || 'EulerAncestralDiscrete',
      createImageSettingsDto.defaultSeed || null,
      createImageSettingsDto.isActive || false,
      new Date(),
      new Date(),
    );

    const result = await this.imageSettingsCollection.insertOne(settings);
    return this.findOne(result.insertedId.toString());
  }

  async update(
    id: string,
    updateImageSettingsDto: UpdateImageSettingsDto,
  ): Promise<ImageSettingsDto> {
    const objectId = new ObjectId(id);

    // If this is set as active, deactivate all others
    if (updateImageSettingsDto.isActive) {
      await this.imageSettingsCollection.updateMany(
        { _id: { $ne: objectId } },
        { $set: { isActive: false } },
      );
    }

    const updateData = {
      ...updateImageSettingsDto,
      updatedAt: new Date(),
    };

    const result = await this.imageSettingsCollection.updateOne(
      { _id: objectId },
      { $set: updateData },
    );

    if (!result.matchedCount) {
      throw new NotFoundException(`Settings with id ${id} not found`);
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const objectId = new ObjectId(id);
    const result = await this.imageSettingsCollection.deleteOne({
      _id: objectId,
    });

    if (!result.deletedCount) {
      throw new NotFoundException(`Settings with id ${id} not found`);
    }
  }

  private mapToDto(settings: any): ImageSettingsDto {
    return {
      id: settings._id.toString(),
      provider: settings.provider,
      providerName: settings.providerName,
      apiKey: settings.apiKey,
      apiUrl: settings.apiUrl,
      defaultNegativePrompt: settings.defaultNegativePrompt,
      defaultWidth: settings.defaultWidth,
      defaultHeight: settings.defaultHeight,
      defaultSamples: settings.defaultSamples,
      defaultNumInferenceSteps: settings.defaultNumInferenceSteps,
      defaultGuidanceScale: settings.defaultGuidanceScale,
      defaultScheduler: settings.defaultScheduler,
      defaultSeed: settings.defaultSeed,
      isActive: settings.isActive,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  private getDefaultSettings(): ImageSettingsDto {
    return {
      id: 'default',
      provider: ImageProvider.MODELSLAB,
      providerName: 'ModelsLab',
      apiKey: 'fYZgDGKGGNBJfzzyZ1ZNnCg6E2CrYULxlbfmxXQwZj8XdKIlIaxbGgZuwQrE',
      apiUrl: 'https://modelslab.com/api/v6/realtime/text2img',
      defaultNegativePrompt: '',
      defaultWidth: '512',
      defaultHeight: '512',
      defaultSamples: '1',
      defaultNumInferenceSteps: '30',
      defaultGuidanceScale: 7.5,
      defaultScheduler: 'EulerAncestralDiscrete',
      defaultSeed: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
}

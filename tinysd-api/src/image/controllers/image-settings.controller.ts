import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ImageSettingsService } from '../services/image-settings.service';
import { CreateImageSettingsDto, UpdateImageSettingsDto } from '../dto/image-settings.dto';

@Controller('image/settings')
export class ImageSettingsController {
  constructor(private readonly imageSettingsService: ImageSettingsService) {}

  @Get()
  async findAll() {
    return this.imageSettingsService.findAll();
  }

  @Get('active')
  async getActiveSettings() {
    return this.imageSettingsService.getActiveSettings();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.imageSettingsService.findOne(id);
  }

  @Post()
  async create(@Body() createImageSettingsDto: CreateImageSettingsDto) {
    return this.imageSettingsService.create(createImageSettingsDto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateImageSettingsDto: UpdateImageSettingsDto,
  ) {
    return this.imageSettingsService.update(id, updateImageSettingsDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.imageSettingsService.remove(id);
    return { message: 'Settings deleted successfully' };
  }
}

import { Controller, Post, Put, Delete, Body, Res, HttpStatus, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../s3.service';
import type { Response } from 'express';

@Controller('api/projects')
export class ProjectApiController {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
  ) {}

  @Post()
@UseInterceptors(FileInterceptor('image')) // 'image' matches the name in FormData
async createProject(@Body() data, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
  try {
    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await this.s3Service.uploadFile(file); // Uploads to Cloudflare R2
    }

    const project = await this.prisma.project.create({
      data: {
        title: data.title,
        description: data.description,
        techStack: data.techStack,
        imageUrl: imageUrl, // Saves the R2 Public URL in the database
        projectUrl: data.projectUrl,
        isEcoFriendly: data.isEcoFriendly === 'true' || data.isEcoFriendly === true,
        serviceId: data.serviceId || null,
      },
    });
    return res.status(HttpStatus.CREATED).json(project);
  } catch (error) {
    return res.status(HttpStatus.BAD_REQUEST).json({ message: error.message });
  }
}

  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async updateProject(@Param('id') id: string, @Body() data, @UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    try {
      const updateData: any = {
        title: data.title,
        description: data.description,
        techStack: data.techStack,
        projectUrl: data.projectUrl,
        isEcoFriendly: data.isEcoFriendly === 'true' || data.isEcoFriendly === true,
        serviceId: data.serviceId || null,
      };

      if (file) updateData.imageUrl = await this.s3Service.uploadFile(file);

      await this.prisma.project.update({ where: { id }, data: updateData });
      return res.status(HttpStatus.OK).json({ message: 'Updated' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Update failed' });
    }
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.prisma.project.delete({ where: { id } });
      return res.status(HttpStatus.OK).json({ message: 'Deleted' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Deletion failed' });
    }
  }
}
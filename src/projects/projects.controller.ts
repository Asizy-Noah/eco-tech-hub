import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Response } from 'express';

@Controller('api/projects')
export class ProjectApiController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createProject(@Body() data, @Res() res: Response) {
    try {
      const project = await this.prisma.project.create({
        data: {
          title: data.title,
          description: data.description,
          techStack: data.techStack,
          imageUrl: data.imageUrl,
          isEcoFriendly: data.isEcoFriendly === true || data.isEcoFriendly === 'true',
        },
      });

      return res.status(HttpStatus.CREATED).json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Could not create project' });
    }
  }
}
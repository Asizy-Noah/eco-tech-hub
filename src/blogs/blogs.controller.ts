import { Controller, Post, Put, Delete, Get, Query, Body, Param, Res, HttpStatus, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { PrismaService } from '../prisma.service';
import { S3Service } from '../s3.service';
import type { Response } from 'express';

@Controller('api/blogs')
export class BlogsApiController {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
  ) {}

  // --- SEARCH ENDPOINTS FOR ATTACHMENTS ---
  @Get('search-projects')
  async searchProjects(@Query('q') q: string, @Res() res: Response) {
    if (!q || q.length < 2) return res.json([]);
    const projects = await this.prisma.project.findMany({
      where: { title: { contains: q } },
      select: { id: true, title: true, imageUrl: true }
    });
    return res.json(projects);
  }

  @Get('search-services')
  async searchServices(@Query('q') q: string, @Res() res: Response) {
    if (!q || q.length < 2) return res.json([]);
    const services = await this.prisma.service.findMany({
      where: { name: { contains: q } },
      select: { id: true, name: true, iconClass: true }
    });
    return res.json(services);
  }

  // --- CRUD LOGIC ---
  @Post()
  @UseInterceptors(AnyFilesInterceptor())
  async createBlog(@Body() data, @UploadedFiles() files: Array<Express.Multer.File>, @Res() res: Response) {
    try {
      const blocks = JSON.parse(data.content);
      
      // Process uploaded files and map them to their respective block attachments
      if (files && files.length > 0) {
        for (const file of files) {
          // Fieldname format: file_{blockId}_{attachmentId}
          const [, blockId, attachId] = file.fieldname.split('_');
          const block = blocks.find(b => b.id == blockId);
          if (block) {
            const attachment = block.attachments.find(a => a.id == attachId);
            if (attachment) {
              attachment.url = await this.s3Service.uploadFile(file, 'blogs');
            }
          }
        }
      }

      // Generate a unique slug
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);

      const blog = await this.prisma.blog.create({
        data: {
          title: data.title,
          slug: slug,
          content: JSON.stringify(blocks),
          isPublished: data.isPublished === 'true' || data.isPublished === true,
        },
      });
      return res.status(HttpStatus.CREATED).json(blog);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Failed to create blog post' });
    }
  }

  @Put(':id')
  @UseInterceptors(AnyFilesInterceptor())
  async updateBlog(@Param('id') id: string, @Body() data, @UploadedFiles() files: Array<Express.Multer.File>, @Res() res: Response) {
    try {
      const blocks = JSON.parse(data.content);
      
      if (files && files.length > 0) {
        for (const file of files) {
          const [, blockId, attachId] = file.fieldname.split('_');
          const block = blocks.find(b => b.id == blockId);
          if (block) {
            const attachment = block.attachments.find(a => a.id == attachId);
            if (attachment) {
              attachment.url = await this.s3Service.uploadFile(file, 'blogs');
            }
          }
        }
      }

      await this.prisma.blog.update({
        where: { id },
        data: {
          title: data.title,
          content: JSON.stringify(blocks),
          isPublished: data.isPublished === 'true' || data.isPublished === true,
        },
      });
      return res.status(HttpStatus.OK).json({ message: 'Updated' });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Update failed' });
    }
  }

  @Delete(':id')
  async deleteBlog(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.prisma.blog.delete({ where: { id } });
      return res.status(HttpStatus.OK).json({ message: 'Deleted' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Deletion failed' });
    }
  }
}
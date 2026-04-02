import { Controller, Post, Put, Delete, Body, Param, Res, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Response } from 'express';

@Controller('api/services')
export class ServicesApiController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async createService(@Body() data, @Res() res: Response) {
    try {
      const service = await this.prisma.service.create({
        data: {
          name: data.name,
          description: data.description,
          iconClass: data.iconClass || 'bx-layer',
        },
      });
      return res.status(HttpStatus.CREATED).json(service);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Creation failed' });
    }
  }

  @Put(':id')
  async updateService(@Param('id') id: string, @Body() data, @Res() res: Response) {
    try {
      const service = await this.prisma.service.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          iconClass: data.iconClass,
        },
      });
      return res.status(HttpStatus.OK).json(service);
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: 'Update failed' });
    }
  }

  @Delete(':id')
  async deleteService(@Param('id') id: string, @Res() res: Response) {
    try {
      await this.prisma.service.delete({ where: { id } });
      return res.status(HttpStatus.OK).json({ message: 'Deleted' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Deletion failed' });
    }
  }
}
import { Controller, Get, Render } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Render('public/home') // We will create this view next
  async getHomePage() {
    // Fetch data concurrently for performance
    const [services, projects, blogs] = await Promise.all([
      this.prisma.service.findMany({ take: 6, orderBy: { createdAt: 'asc' } }),
      this.prisma.project.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
      this.prisma.blog.findMany({ 
        where: { isPublished: true }, 
        take: 3, 
        orderBy: { createdAt: 'desc' } 
      })
    ]);

    return {
      layout: 'layouts/main',
      title: 'Eco Tech Hub | Sustainable Web Development',
      services,
      projects,
      blogs
    };
  }
}
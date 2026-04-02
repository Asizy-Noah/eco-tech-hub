import { Controller, Get, Render } from '@nestjs/common';
import { PrismaService } from '../prisma.service';


@Controller('admin')
export class AdminController {
    constructor(private prisma: PrismaService) {}
  
  @Get('login')
  @Render('admin/login')
  getLoginPage() {
    return {};
  }

  @Get('dashboard')
  @Render('admin/dashboard')
  getDashboard() {
    return { layout: 'layouts/admin', title: 'Dashboard | Eco Tech Hub' };
  }

  @Get('projects')
  @Render('admin/projects')
  async getProjectsPage() {
    // Fetch all projects from SQLite, ordered by newest first
    const projects = await this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return { 
      layout: 'layouts/admin', 
      title: 'Manage Projects | Eco Tech Hub',
      projects 
    };
  }

  @Get('projects/new')
  @Render('admin/projects_new')
  getNewProjectPage() {
    return { layout: 'layouts/admin', title: 'New Project | Eco Tech Hub' };
  }
}
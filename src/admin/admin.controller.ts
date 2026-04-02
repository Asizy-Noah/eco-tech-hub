import { Controller, Get, Render, Param, Res } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import type { Response } from 'express';


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

  // Add this inside AdminController
  @Get('projects/edit/:id')
  @Render('admin/projects_edit')
  async getEditProjectPage(@Param('id') id: string, @Res() res) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) return res.redirect('/admin/projects'); // Fallback if ID is invalid

    return { 
      layout: 'layouts/admin', 
      title: 'Edit Project | Eco Tech Hub',
      project // Pass the data to the view
    };
  }
}
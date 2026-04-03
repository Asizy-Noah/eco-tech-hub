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

  // --- SERVICES VIEWS ---
  @Get('services')
  @Render('admin/services')
  async getServicesPage() {
    const services = await this.prisma.service.findMany({ orderBy: { createdAt: 'desc' } });
    return { layout: 'layouts/admin', title: 'Manage Services | Eco Tech Hub', services };
  }

  @Get('services/new')
  @Render('admin/services_new')
  getNewServicePage() {
    return { layout: 'layouts/admin', title: 'New Service | Eco Tech Hub' };
  }

  @Get('services/edit/:id')
  @Render('admin/services_edit')
  async getEditServicePage(@Param('id') id: string, @Res() res: Response) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    
    // If the service is not found, redirect and STOP execution
    if (!service) {
      return res.redirect('/admin/services');
    }

    // Pass the 'service' variable explicitly to the view
    return { 
      layout: 'layouts/admin', 
      title: 'Edit Service | Eco Tech Hub',
      service // Ensure this matches the name used in your EJS file
    };
  }

  // --- BLOG VIEWS ---
  @Get('blogs')
  @Render('admin/blogs')
  async getBlogsPage() {
    const blogs = await this.prisma.blog.findMany({ orderBy: { createdAt: 'desc' } });
    return { layout: 'layouts/admin', title: 'Manage Blogs', blogs };
  }

  @Get('blogs/new')
  @Render('admin/blogs_new')
  getNewBlogPage() {
    return { layout: 'layouts/admin', title: 'New Blog' };
  }

  @Get('blogs/edit/:id')
    async getEditBlogPage(@Param('id') id: string, @Res() res: Response) {
        const blog = await this.prisma.blog.findUnique({ where: { id } });
        
        // If the blog doesn't exist, redirect safely
        if (!blog) {
            return res.redirect('/admin/blogs');
        }

        // Use res.render manually here to avoid @Render conflicts with redirect
        return res.render('admin/blogs_edit', { 
            layout: 'layouts/admin', 
            title: 'Edit Post | Eco Tech Hub',
            blog // This defines the variable your EJS file is looking for
        });
    }
}
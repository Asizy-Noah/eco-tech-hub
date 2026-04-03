import { Controller, Get, Param, Render, Res } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { Response } from 'express';

@Controller()
export class AppController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @Render('public/home')
  async getHomePage() {
    const [services, projects, blogs] = await Promise.all([
      this.prisma.service.findMany({ take: 6, orderBy: { createdAt: 'asc' } }),
      this.prisma.project.findMany({ take: 6, orderBy: { createdAt: 'desc' } }),
      this.prisma.blog.findMany({ where: { isPublished: true }, take: 3, orderBy: { createdAt: 'desc' } })
    ]);
    return { layout: 'layouts/main', title: 'Eco Tech Hub | Sustainable Web Development', services, projects, blogs };
  }

  @Get('projects')
  @Render('public/projects')
  async getProjectsPage() {
    const projects = await this.prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    const techStacks = new Set<string>();
    projects.forEach(p => {
      if (p.techStack) p.techStack.split(',').forEach(tech => techStacks.add(tech.trim()));
    });
    return { layout: 'layouts/main', title: 'Our Work | Eco Tech Hub', projects, techStacks: Array.from(techStacks) };
  }

  @Get('services')
  @Render('public/services')
  async getServicesPage() {
    const services = await this.prisma.service.findMany({ orderBy: { createdAt: 'asc' } });
    return { layout: 'layouts/main', title: 'Capabilities | Eco Tech Hub', services };
  }

  @Get('blog')
  @Render('public/blog')
  async getBlogPage() {
    const blogs = await this.prisma.blog.findMany({ 
      where: { isPublished: true }, 
      orderBy: { createdAt: 'desc' } 
    });
    return { layout: 'layouts/main', title: 'Sustainability Journal | Eco Tech Hub', blogs };
  }

  @Get('blog/:slug')
  async getSingleBlog(@Param('slug') slug: string, @Res() res: Response) {
    const blog = await this.prisma.blog.findUnique({ where: { slug } });
    if (!blog || !blog.isPublished) return res.redirect('/blog');
    return res.render('public/blog-single', { layout: 'layouts/main', title: `${blog.title} | Eco Tech Hub`, blog });
  }

  @Get('contact')
  @Render('public/contact')
  getContactPage() {
    return { layout: 'layouts/main', title: 'Contact Us | Eco Tech Hub' };
  }

  @Get('privacy-policy')
  @Render('public/privacy')
  getPrivacyPage() {
    return { layout: 'layouts/main', title: 'Privacy Policy | Eco Tech Hub' };
  }

  @Get('terms-of-service')
  @Render('public/terms')
  getTermsPage() {
    return { layout: 'layouts/main', title: 'Terms of Service | Eco Tech Hub' };
  }
}
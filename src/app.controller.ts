import { Controller, Get, Param, Render, Res, Query } from '@nestjs/common';
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
  // Fetch projects (including the linked service) and the full services list
  const [projects, services] = await Promise.all([
    this.prisma.project.findMany({ 
      include: { service: true }, 
      orderBy: { createdAt: 'desc' } 
    }),
    this.prisma.service.findMany({
      orderBy: { name: 'asc' }
    })
  ]);

  return { 
    layout: 'layouts/main', 
    title: 'Our Work | Eco Tech Hub', 
    projects, 
    services 
  };
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

  @Get('api/search')
  async globalSearch(@Query('q') q: string, @Res() res: Response) {
    if (!q || q.trim() === '') {
      return res.json({ projects: [], services: [], blogs: [] });
    }

    const term = q.toLowerCase().trim();

    // Fetch all records (since it's a portfolio, the dataset is light and this is incredibly fast)
    const [allProjects, allServices, allBlogs] = await Promise.all([
      this.prisma.project.findMany({ include: { service: true } }),
      this.prisma.service.findMany(),
      this.prisma.blog.findMany({ where: { isPublished: true } })
    ]);

    // Filter in-memory for perfect case-insensitivity
    const projects = allProjects.filter(p => 
      p.title.toLowerCase().includes(term) || 
      p.techStack.toLowerCase().includes(term) || 
      p.description.toLowerCase().includes(term)
    ).slice(0, 4); // Limit to top 4 results

    const services = allServices.filter(s => 
      s.name.toLowerCase().includes(term) || 
      s.description.toLowerCase().includes(term)
    ).slice(0, 3);

    const blogs = allBlogs.filter(b => 
      b.title.toLowerCase().includes(term)
    ).slice(0, 3);

    return res.json({ projects, services, blogs });
  }

}
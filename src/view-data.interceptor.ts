import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PrismaService } from './prisma.service';

@Injectable()
export class ViewDataInterceptor implements NestInterceptor {
  constructor(private prisma: PrismaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    // Only fetch global data if the response is likely a View (object return)
    // and not a simple API response string or null
    return next.handle().pipe(
      map(async (data) => {
        if (data && typeof data === 'object') {
          // Fetch global essentials concurrently
          const [globalServices, globalProjects, globalBlogs] = await Promise.all([
            this.prisma.service.findMany({ take: 4, orderBy: { createdAt: 'asc' } }),
            this.prisma.project.findMany({ take: 4, orderBy: { createdAt: 'desc' } }),
            this.prisma.blog.findMany({ 
              where: { isPublished: true }, 
              take: 3, 
              orderBy: { createdAt: 'desc' } 
            }),
          ]);

          return {
            ...data,
            // These are now available in EVERY .ejs file automatically
            services: data.services || globalServices,
            projects: data.projects || globalProjects,
            blogs: data.blogs || globalBlogs,
            // Helper for the footer
            footerServices: globalServices,
          };
        }
        return data;
      }),
    );
  }
}